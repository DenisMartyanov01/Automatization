from db import *
from sqlalchemy.orm import Session
from fastapi import Depends, FastAPI, Body
from fastapi.responses import JSONResponse, FileResponse
 
app = FastAPI()
 
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
  
@app.get("/")
def main():
    return FileResponse("public/index.html")
  
@app.get("/api/users")
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()
  
@app.get("/api/users/{id}")
def get_user(id, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == id).first()
    if user==None:  
        return JSONResponse(status_code=404, content={ "message": "Пользователь не найден"})
    return user
  
  
@app.post("/api/users")
def create_user(data  = Body(), db: Session = Depends(get_db)):
    user = User(name=data["name"], password=data["password"], email=data["email"])
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
  
@app.put("/api/users")
def edit_user(data  = Body(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == data["id"]).first()
    if user == None: 
        return JSONResponse(status_code=404, content={ "message": "Пользователь не найден"})
    user.password = data["password"]
    user.name = data["name"]
    user.email = data["email"]
    db.commit() 
    db.refresh(user)
    return user
  
  
@app.delete("/api/users/{id}")
def delete_user(id, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == id).first()
   
    if user == None:
        return JSONResponse( status_code=404, content={ "message": "Пользователь не найден"})
   
    db.delete(user)  
    db.commit()   
    return user