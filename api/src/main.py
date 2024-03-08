from models import ResponseDto, BalanceRequestDto, BookingRequestDto
from atoss import get_balance, post_booking
from fastapi import FastAPI, HTTPException


app = FastAPI()

@app.post('/api/balance')
def balance(body: BalanceRequestDto) -> ResponseDto:
    try:
        return get_balance(
            personal_number=body.personal_number,
            pin=body.pin,
        )
    except:
        raise HTTPException(status_code=403)

@app.post('/api/booking')
def booking(body: BookingRequestDto) -> ResponseDto:
    try:
        return post_booking(
            personal_number=body.personal_number,
            pin=body.pin,
            action=body.action,
            type=body.type,
        )
    except:
        raise HTTPException(status_code=403)
