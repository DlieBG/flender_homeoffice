from pydantic import BaseModel
from typing import Optional
from enum import Enum

class Session(BaseModel):
    jsession: str
    dt: str
    selection_uuids: dict

class CommandEnum(str, Enum):
    on_change = 'onChange'
    on_click = 'onClick'
    on_select = 'onSelect'

class ActionEnum(str, Enum):
    start = 'Kommen'
    stop = 'Gehen'

class TypeEnum(str, Enum):
    homeoffice = 'HB'
    trip = '10'

class CallItem(BaseModel):
    command: CommandEnum
    uuid: str
    data: dict = {}

class ResponseDto(BaseModel):
    personal_number: str
    name: str
    booked_time: Optional[str]
    action: Optional[ActionEnum]
    type: Optional[TypeEnum]
    flexi_date: str
    flexi_balance: str

class BalanceRequestDto(BaseModel):
    personal_number: str
    pin: str

class BookingRequestDto(BaseModel):
    personal_number: str
    pin: str
    action: ActionEnum
    type: TypeEnum
