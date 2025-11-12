from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Incident, Person
from schemas import IncidentCreate, IncidentResponse, PublicIncidentResponse
from auth import get_current_user
import uuid

router = APIRouter()

@router.get("/public", response_model=List[PublicIncidentResponse])
def get_public_incidents(db: Session = Depends(get_db)):
    """Public endpoint - no authentication required"""
    incidents = db.query(Incident).all()
    return [{"registration_number": inc.registration_number, "location": inc.location} 
            for inc in incidents]

@router.get("/", response_model=List[IncidentResponse])
def get_all_incidents(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all incidents - requires authentication"""
    incidents = db.query(Incident).all()
    
    # Convert to response format with involvedPersons as list of IDs
    result = []
    for inc in incidents:
        incident_dict = {
            "id": inc.id,
            "registration_number": inc.registration_number,
            "type": inc.type,
            "description": inc.description,
            "location": inc.location,
            "date": inc.date,
            "severity": inc.severity.value,
            "involvedPersons": [p.id for p in inc.involved_persons]
        }
        result.append(incident_dict)
    
    return result

@router.post("/", response_model=IncidentResponse)
def create_incident(
    incident: IncidentCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new incident - requires authentication"""
    new_incident = Incident(
        id=f"inc-{uuid.uuid4()}",
        registration_number=f"RN{uuid.uuid4().hex[:6].upper()}",
        type=incident.type,
        description=incident.description,
        location=incident.location,
        severity=incident.severity,
        date=datetime.utcnow()
    )
    
    # Add involved persons
    for person_id in incident.involvedPersons:
        person = db.query(Person).filter(Person.id == person_id).first()
        if person:
            new_incident.involved_persons.append(person)
    
    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)
    
    return {
        "id": new_incident.id,
        "registration_number": new_incident.registration_number,
        "type": new_incident.type,
        "description": new_incident.description,
        "location": new_incident.location,
        "date": new_incident.date,
        "severity": new_incident.severity.value,
        "involvedPersons": [p.id for p in new_incident.involved_persons]
    }

@router.get("/by-person/{person_id}", response_model=List[IncidentResponse])
def get_incidents_by_person(
    person_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all incidents involving a specific person"""
    person = db.query(Person).filter(Person.id == person_id).first()
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    
    result = []
    for inc in person.incidents:
        incident_dict = {
            "id": inc.id,
            "registration_number": inc.registration_number,
            "type": inc.type,
            "description": inc.description,
            "location": inc.location,
            "date": inc.date,
            "severity": inc.severity.value,
            "involvedPersons": [p.id for p in inc.involved_persons]
        }
        result.append(incident_dict)
    
    return result