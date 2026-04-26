from django.db import models
from django.db.models import Count, OuterRef, Subquery

class Broker(models.Model):
    """
    Represents an external Broker entity who brings in submissions.
    """
    name = models.CharField(max_length=255, help_text="The full name of the brokerage firm or independent broker.")
    primary_contact_email = models.EmailField(blank=True, help_text="Primary email address for the broker.")

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:  # pragma: no cover
        return self.name


class Company(models.Model):
    """
    Represents the target Company associated with a given submission opportunity.
    """
    legal_name = models.CharField(max_length=255, help_text="The official registered legal name of the company.", db_index=True)
    industry = models.CharField(max_length=255, blank=True, help_text="The primary sector or industry of the company.")
    headquarters_city = models.CharField(max_length=255, blank=True, help_text="The city where the company is headquartered.")

    class Meta:
        ordering = ["legal_name"]

    def __str__(self) -> str:  # pragma: no cover
        return self.legal_name


class TeamMember(models.Model):
    """
    Represents an internal Team Member within our organization who owns submissions.
    """
    full_name = models.CharField(max_length=255, help_text="Full legal name of the team member.")
    email = models.EmailField(unique=True, help_text="Unique organizational email address.")

    class Meta:
        ordering = ["full_name"]

    def __str__(self) -> str:  # pragma: no cover
        return self.full_name


class SubmissionQuerySet(models.QuerySet):
    """
    Custom QuerySet for Submissions encapsulating complex DB queries.
    """
    def with_counts_and_previews(self):
        """
        Optimizes query performance by aggregating related counts and pulling the
        latest Note preview using an efficient subquery. Avoids severe N+1 latency.
        
        Returns:
            QuerySet[Submission]: Annotated queryset populated with document_count,
            note_count, and latest_note fields.
        """
        latest_note = Note.objects.filter(submission_id=OuterRef("pk")).order_by("-created_at")
        return self.select_related("company", "broker", "owner").annotate(
            document_count=Count("documents", distinct=True),
            note_count=Count("notes", distinct=True),
            latest_note_author=Subquery(latest_note.values("author_name")[:1]),
            latest_note_body=Subquery(latest_note.values("body")[:1]),
            latest_note_created_at=Subquery(latest_note.values("created_at")[:1]),
        ).order_by("-created_at")


class SubmissionManager(models.Manager):
    """
    Custom Manager enforcing the use of SubmissionQuerySet.
    """
    def get_queryset(self):
        return SubmissionQuerySet(self.model, using=self._db)

    def with_counts_and_previews(self):
        return self.get_queryset().with_counts_and_previews()


class Submission(models.Model):
    """
    The core entity representing a submitted opportunity under review.
    """
    class Status(models.TextChoices):
        NEW = "new", "New"
        IN_REVIEW = "in_review", "In Review"
        CLOSED = "closed", "Closed"
        LOST = "lost", "Lost"

    class Priority(models.TextChoices):
        HIGH = "high", "High"
        MEDIUM = "medium", "Medium"
        LOW = "low", "Low"

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="submissions", help_text="Company tied to this submission.")
    broker = models.ForeignKey(Broker, on_delete=models.PROTECT, related_name="submissions", help_text="The broker who submitted this.")
    owner = models.ForeignKey(TeamMember, on_delete=models.PROTECT, related_name="submissions", help_text="The internal operations manager owning this review.")
    status = models.CharField(max_length=32, choices=Status.choices, default=Status.NEW, db_index=True, help_text="Current state of the submission workflow.")
    priority = models.CharField(max_length=32, choices=Priority.choices, default=Priority.MEDIUM, db_index=True, help_text="Priority level relative to other submissions.")
    summary = models.TextField(blank=True, help_text="High-level overview of the submission parameters.")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True, help_text="Timestamp when the submission entered the system.")
    updated_at = models.DateTimeField(auto_now=True, help_text="Timestamp of the last update.")

    objects = SubmissionManager()

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.company} ({self.status})"


class Contact(models.Model):
    """
    Key stakeholders and points of contact tied to a submission.
    """
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE, related_name="contacts")
    name = models.CharField(max_length=255, help_text="Full name of the contact.")
    role = models.CharField(max_length=255, blank=True, help_text="Title or role within the relative organization.")
    email = models.EmailField(blank=True, help_text="Contact email.")
    phone = models.CharField(max_length=64, blank=True, help_text="Contact phone number.")

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:  # pragma: no cover
        return self.name


class Document(models.Model):
    """
    File metadata references tied to a submission payload.
    """
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE, related_name="documents")
    title = models.CharField(max_length=255, help_text="Human readable document title.")
    doc_type = models.CharField(max_length=255, help_text="Categorization of the document (e.g. NDA, Term Sheet).")
    uploaded_at = models.DateTimeField(auto_now_add=True, help_text="Datetime of document upload.")
    file_url = models.URLField(blank=True, help_text="S3 link or remote URL addressing the absolute file.")

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self) -> str:  # pragma: no cover
        return self.title


class Note(models.Model):
    """
    Threaded text correspondence providing ongoing context to a submission.
    """
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE, related_name="notes")
    author_name = models.CharField(max_length=255, help_text="Name of the user who authored this note.")
    body = models.TextField(help_text="Detailed payload of the timeline note.")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True, help_text="Timestamp of creation.")

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.author_name} - {self.created_at:%Y-%m-%d}"

