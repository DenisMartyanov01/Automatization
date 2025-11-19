# tests/unit/test_models.py
import pytest
from datetime import datetime, timezone

def test_user_model_creation():
    """Тестируем создание модели пользователя"""
    from main import User
    
    user = User(
        username="testuser",
        hashed_password="hashed_password_123"
    )
    
    assert user.username == "testuser"
    assert user.hashed_password == "hashed_password_123"


def test_person_model_creation():
    """Тестируем создание модели персоны"""
    from main import Person
    
    person = Person(
        name="John Doe",
        address="123 Main St",
        role="witness",
        phone="+1234567890",
        email="john@example.com"
    )
    
    assert person.name == "John Doe"
    assert person.address == "123 Main St"
    assert person.role == "witness"
    assert person.phone == "+1234567890"
    assert person.email == "john@example.com"

def test_incident_model_creation():
    """Тестируем создание модели инцидента"""
    from main import Incident
    
    incident = Incident(
        type="Theft",
        description="Stolen laptop",
        location="Office building",
        severity="medium"
    )
    
    assert incident.type == "Theft"
    assert incident.description == "Stolen laptop"
    assert incident.location == "Office building"
    assert incident.severity == "medium"