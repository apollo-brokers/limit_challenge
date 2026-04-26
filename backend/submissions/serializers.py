from typing import Optional, Dict, Any
from rest_framework import serializers

from . import models


class BrokerSerializer(serializers.ModelSerializer):
    """
    Serializer for the Broker model, representing the external party.
    Used both as a standalone list and nested inside Submission context.
    """
    class Meta:
        model = models.Broker
        fields = ["id", "name", "primary_contact_email"]


class CompanySerializer(serializers.ModelSerializer):
    """
    Serializer for the Company model representing the target firm.
    """
    class Meta:
        model = models.Company
        fields = ["id", "legal_name", "industry", "headquarters_city"]


class TeamMemberSerializer(serializers.ModelSerializer):
    """
    Serializer for internal operations Team Members.
    """
    class Meta:
        model = models.TeamMember
        fields = ["id", "full_name", "email"]


class ContactSerializer(serializers.ModelSerializer):
    """
    Serializer extracting specific stakeholders tied to a submission.
    """
    class Meta:
        model = models.Contact
        fields = ["id", "name", "role", "email", "phone"]


class DocumentSerializer(serializers.ModelSerializer):
    """
    Serializer for exposing documentation metadata.
    Does not serialize the actual file payload, only the URL reference.
    """
    class Meta:
        model = models.Document
        fields = ["id", "title", "doc_type", "uploaded_at", "file_url"]


class NoteSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for threaded timeline Notes.
    Ordered descending by default via model Meta.
    """
    class Meta:
        model = models.Note
        fields = ["id", "author_name", "body", "created_at"]


class SubmissionListSerializer(serializers.ModelSerializer):
    """
    Densely optimized Serializer exclusively for List/Pagination endpoints.
    
    Contains integer-computed fields (document_count, note_count) that must
    be provided by the SubmissionQuerySet annotation logic to prevent N+1 hits.
    """
    broker = BrokerSerializer(read_only=True)
    company = CompanySerializer(read_only=True)
    owner = TeamMemberSerializer(read_only=True)
    document_count = serializers.IntegerField(read_only=True, default=0)
    note_count = serializers.IntegerField(read_only=True, default=0)
    latest_note = serializers.SerializerMethodField()

    class Meta:
        model = models.Submission
        fields = [
            "id",
            "status",
            "priority",
            "summary",
            "created_at",
            "updated_at",
            "broker",
            "company",
            "owner",
            "document_count",
            "note_count",
            "latest_note",
        ]

    def get_latest_note(self, obj: models.Submission) -> Optional[Dict[str, Any]]:
        """
        Dynamically grabs the latest note text and truncates it.
        
        CRITICAL: Relies on `getattr` rather than relationship crossing `obj.notes` 
        because the latest note data was already pre-annotated in the QuerySet via Subquery! 
        This is O(1) performance rather than O(N).
        """
        author = getattr(obj, "latest_note_author", None)
        body = getattr(obj, "latest_note_body", None)
        created = getattr(obj, "latest_note_created_at", None)
        if not (author or body or created):
            return None
            
        preview = (body or "")[:200]
        return {
            "author_name": author,
            "body_preview": preview,
            "created_at": created,
        }


class SubmissionDetailSerializer(serializers.ModelSerializer):
    """
    Heavy Serializer exclusively for Detail `retrieve` actions.
    
    Eagerly serializes deep relations (Contacts, Documents, Notes). Ensure
    the ViewSet has performed `.prefetch_related()` prior to invocation.
    """
    broker = BrokerSerializer(read_only=True)
    company = CompanySerializer(read_only=True)
    owner = TeamMemberSerializer(read_only=True)
    contacts = ContactSerializer(many=True, read_only=True)
    documents = DocumentSerializer(many=True, read_only=True)
    notes = NoteSerializer(many=True, read_only=True)

    class Meta:
        model = models.Submission
        fields = [
            "id",
            "status",
            "priority",
            "summary",
            "created_at",
            "updated_at",
            "broker",
            "company",
            "owner",
            "contacts",
            "documents",
            "notes",
        ]
