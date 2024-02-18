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
    return post_booking(
        personal_number=body.personal_number,
        pin=body.pin,
        action=body.action,
        type=body.type,
    )

