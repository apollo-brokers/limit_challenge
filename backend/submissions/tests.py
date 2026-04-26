from django.urls import reverse
from rest_framework.test import APITestCase
from submissions.models import Broker, Company, TeamMember, Submission, Document

class SubmissionAPITests(APITestCase):
    """
    Integration tests covering the Submission API endpoints.
    Focused on asserting complex filter correctness and N+1 query protection.
    """
    
    def setUp(self):
        """Build fundamental fixtures required for submission interactions."""
        self.company = Company.objects.create(legal_name="Acme Corp", industry="Tech")
        self.company2 = Company.objects.create(legal_name="Globex Inc", industry="Manufacturing")
        self.broker = Broker.objects.create(name="TopBroker LLC")
        self.owner = TeamMember.objects.create(full_name="Alice Smith", email="alice@test.com")
        
        self.sub1 = Submission.objects.create(
            company=self.company,
            broker=self.broker,
            owner=self.owner,
            status=Submission.Status.NEW,
            priority=Submission.Priority.HIGH,
        )
        
        self.sub2 = Submission.objects.create(
            company=self.company2,
            broker=self.broker,
            owner=self.owner,
            status=Submission.Status.IN_REVIEW,
            priority=Submission.Priority.LOW,
        )
        
        # Add a document only to Sub1
        Document.objects.create(
            submission=self.sub1,
            title="NDA.pdf",
            doc_type="NDA",
            file_url="http://s3.amazonaws.com/test",
        )

    def test_n_plus_one_query_protection(self):
        """
        Verify that hitting the list endpoint invokes exactly the expected baseline 
        amount of queries, regardless of how many submissions or relational objects exist.
        """
        url = reverse('submission-list')
        # Expect exactly 2 queries: one for the COUNT(*) for pagination, one for the data.
        with self.assertNumQueries(2):
            self.client.get(url)

    def test_company_search_filter(self):
        """
        Verify the custom Case-Insensitive partial string filter on company name.
        """
        url = reverse('submission-list')
        response = self.client.get(url, {'companySearch': 'acme'})
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['company']['legal_name'], "Acme Corp")

    def test_has_documents_boolean_filter(self):
        """
        Verify the complex boolean filter properly taps into the QuerySet annotations.
        """
        url = reverse('submission-list')
        
        # Test True
        response_true = self.client.get(url, {'hasDocuments': 'true'})
        self.assertEqual(response_true.data['count'], 1)
        self.assertEqual(response_true.data['results'][0]['id'], self.sub1.id)
        
        # Test False
        response_false = self.client.get(url, {'hasDocuments': 'false'})
        self.assertEqual(response_false.data['count'], 1)
        self.assertEqual(response_false.data['results'][0]['id'], self.sub2.id)
