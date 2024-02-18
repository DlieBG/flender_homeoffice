from models import ResponseDto, BalanceRequestDto, BookingRequestDto
from atoss import get_balance, post_booking
from fastapi import FastAPI


app = FastAPI()

@app.post('/api/balance')
def balance(body: BalanceRequestDto) -> ResponseDto:
    return get_balance(
        personal_number=body.personal_number,
        pin=body.pin,
    )

@app.post('/api/booking')
def booking(body: BookingRequestDto) -> ResponseDto:
    print(body)
    return ResponseDto(
        personal_number="1234",
        name="Schwering, Bene",
        booked_time="10:10:36",
        action=body.action,
        type=body.type,
        flexi_date="17.02.2024",
        flexi_balance="10:01",
    )

    return post_booking(
        personal_number=body.personal_number,
        pin=body.pin,
        action=body.action,
        type=body.type,
    )

