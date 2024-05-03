from exceptions import CredentialsWrongException, CredentialsBlockedException, EmployeeBlockedException, EmployeeNotFoundException
from models import Session, CommandEnum, ActionEnum, TypeEnum, CallItem, ResponseDto
from collections import ChainMap
import re, json, requests


__init_url = 'https://flender.atoss.com/flenderprod/uuid273c0b0d-d5fe-4786-ab44-ed94d2683c08/time?configfile=TimeConfigurationHO.xml&rlc=0'
__call_url = 'https://flender.atoss.com/flenderprod/uuid273c0b0d-d5fe-4786-ab44-ed94d2683c08/zkau'
__keys = [
    'Personalnummer',
    'Name',
    'Verbuchte Zeit',
    'Buchungstyp',
    'Fehlgrund',
    'Saldenstände zum',
    'Gleitzeit',
]

def __init_session() -> Session:
    init_response = requests.get(
        url=__init_url,
    )

    return Session(
        jsession=init_response.headers.get(
            'Atoss-Ases-Sessionid'
        ),
        dt=re.search(
            pattern='(?<=dt:\').+?(?=\')',
            string=init_response.text,
        ).group(),
        selection_uuids={
            re.search(
                pattern='(?<=value:\').+?(?=\'})',
                string=option,
            ).group(): re.search(
                pattern='(?<=\[\'zul.sel.Option\',\').+?(?=\')',
                string=option
            ).group() 
                for option in init_response.text.splitlines()
                    if option.startswith('[\'zul.sel.Option\'') and 'value' in option
        },
        cookies=init_response.cookies.get_dict(),
    )

def __call(session: Session, *arguments: CallItem) -> ResponseDto:
    call_response = requests.post(
        url=f'{__call_url};jsessionid={session.jsession}',
        data={
            'dtid': session.dt,
            **dict(
                ChainMap(
                    *reversed([
                        {
                            f'cmd_{i}': argument.command,
                            f'uuid_{i}': argument.uuid,
                            f'data_{i}': json.dumps(argument.data),
                        } for i, argument in enumerate(arguments)
                    ]),
                ),
            ),
        },
        cookies=session.cookies,
    )

    if 'Kombination Personalnummer / PIN-Code falsch' in call_response.text:
        raise CredentialsWrongException()
    if 'Pin-Code gesperrt' in call_response.text:
        raise CredentialsBlockedException()
    if 'Mitarbeiter nimmt nicht an Arbeitsplatzzeiterfassung teil' in call_response.text:
        raise EmployeeBlockedException()
    if 'Kartennummer nicht bekannt' in call_response.text:
        raise EmployeeNotFoundException()

    entries = []

    for entry in call_response.text.splitlines():
        if entry.startswith('[\'zul.wgt.Label\''):
            match = re.search(
                pattern='(?<=value:\').+?(?=\'})',
                string=entry
            )

            if match:
                entries.append(match.group())

    response = {
        entries[i]: (
            entries[i + 1] 
            if i < len(entries) - 1 and entries[i + 1] not in __keys else
            None
        ) for i, entry in enumerate(entries)
            if entry in __keys
    }

    return ResponseDto(
        personal_number=response['Personalnummer'],
        name=response['Name'],
        booked_time=response['Verbuchte Zeit'],
        action=response['Buchungstyp'],
        type=response['Fehlgrund'],
        flexi_date=response['Saldenstände zum'],
        flexi_balance=response['Gleitzeit'],
    )

def get_balance(personal_number: str, pin: str) -> ResponseDto:
    return __call(
        __init_session(),
        CallItem(
            command=CommandEnum.on_change,
            uuid='badgeno',
            data={
                'value': personal_number,
            },
        ),
        CallItem(
            command=CommandEnum.on_change,
            uuid='pincode',
            data={
                'value': pin,
            },
        ),
        CallItem(
            command=CommandEnum.on_click,
            uuid='TIME2',
        ),
    )

def post_booking(personal_number: str, pin: str, action: ActionEnum, type: TypeEnum) -> dict:
    session = __init_session()

    return __call(
        session,
        CallItem(
            command=CommandEnum.on_change,
            uuid='badgeno',
            data={
                'value': personal_number,
            },
        ),
        CallItem(
            command=CommandEnum.on_change,
            uuid='pincode',
            data={
                'value': pin,
            },
        ),
        CallItem(
            command=CommandEnum.on_select,
            uuid='req_code',
            data={
                'items': [
                    session.selection_uuids[action.value],
                ],
                'reference': session.selection_uuids[action.value],
            },
        ),
        CallItem(
            command=CommandEnum.on_select,
            uuid='codeid',
            data={
                'items': [
                    session.selection_uuids[type.value],
                ],
                'reference': session.selection_uuids[type.value],
            },
        ),
        CallItem(
            command=CommandEnum.on_click,
            uuid='ok',
        ),
    )
