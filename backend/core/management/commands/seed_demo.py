from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from accounts.models import User, Donor
from core.models import (
    BloodRequest,
    RequestResponse,
    Donation,
    Camp,
    Partner,
    WellnessTip,
)

class Command(BaseCommand):
    help = 'Seeds initial demonstration data (8 donors, 6 requests, 3 camps, 6 wellness tips, 4 blood banks)'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding UDAAN demo data...")

        # 1. Donors (8 donors across Lucknow, Jaipur, Delhi)
        donor_specs = [
            ("Kavita Sharma", "kavita.sharma@example.com", "O+", "Delhi", "Delhi", "110001", "+91 98101 22334", 56, "female", date.today() - timedelta(days=120)),
            ("Amitabh Verma", "amitabh.v@example.com", "A+", "Uttar Pradesh", "Lucknow", "226001", "+91 94150 11223", 72, "male", date.today() - timedelta(days=100)),
            ("Rohit Rathore", "rohit.r@example.com", "B+", "Rajasthan", "Jaipur", "302001", "+91 98290 33445", 68, "male", date.today() - timedelta(days=150)),
            ("Sneha Gupta", "sneha.g@example.com", "AB+", "Delhi", "Delhi", "110029", "+91 99100 44556", 54, "female", None),
            ("Zaid Khan", "zaid.k@example.com", "O-", "Uttar Pradesh", "Lucknow", "226003", "+91 93350 55667", 75, "male", None),
            ("Meera Shekhawat", "meera.s@example.com", "A-", "Rajasthan", "Jaipur", "302015", "+91 94140 66778", 58, "female", date.today() - timedelta(days=45)),  # On cooldown
            ("Vikas Yadav", "vikas.y@example.com", "B-", "Delhi", "Delhi", "110085", "+91 98111 77889", 70, "male", date.today() - timedelta(days=95)),
            ("Ananya Mishra", "ananya.m@example.com", "AB-", "Uttar Pradesh", "Lucknow", "226010", "+91 94500 88990", 52, "female", None),
        ]

        created_donors = []
        for name, email, bg, state, city, pincode, phone, weight, gender, last_date in donor_specs:
            user, _ = User.objects.get_or_create(
                email=email,
                defaults={
                    'firebase_uid': f"uid_{email.split('@')[0]}",
                    'display_name': name,
                    'role': 'donor',
                }
            )
            donor, _ = Donor.objects.get_or_create(
                user=user,
                defaults={
                    'name': name,
                    'blood_group': bg,
                    'state': state,
                    'city': city,
                    'pincode': pincode,
                    'phone': phone,
                    'email': email,
                    'weight_kg': weight,
                    'gender': gender,
                    'last_donation_date': last_date,
                    'is_available': True,
                    'is_verified': True,
                    'consent_display': True,
                }
            )
            created_donors.append(donor)

        # 2. Requester User
        req_user, _ = User.objects.get_or_create(
            email="hospital.liaison@aiims.gov.in",
            defaults={
                'firebase_uid': "uid_aiims_liaison",
                'display_name': "AIIMS Blood Cell",
                'role': 'requester',
            }
        )

        # 3. Blood Requests (6 requests)
        request_specs = [
            ("Rameshwar Dayal", "Praveen Dayal", "+91 98188 12345", "AIIMS Trauma Centre", "ICU-3", "Delhi", "Delhi", "110029", "O+", "whole_blood", 3, "critical", "Pending", 28.5672, 77.2100),
            ("Suman Devi", "Rakesh Kumar", "+91 94155 98765", "KGMU Trauma Centre", "Emergency Bed 14", "Uttar Pradesh", "Lucknow", "226003", "B+", "platelets", 2, "critical", "Matched", 26.8687, 80.9135),
            ("Harish Shekhawat", "Devendra Singh", "+91 98299 45678", "SMS Hospital", "Ward 12A", "Rajasthan", "Jaipur", "302004", "A+", "whole_blood", 2, "urgent", "Pending", 26.8917, 75.8166),
            ("Baby Aarohi (1.5 yr)", "Ankit Mehra", "+91 99112 34567", "Safdarjung Hospital", "NICU", "Delhi", "Delhi", "110029", "O-", "rbc", 1, "critical", "PartiallyFulfilled", 28.5700, 77.2070),
            ("Fatima Begum", "Mohd. Salim", "+91 93351 24680", "SGPGI", "Hematology Dept", "Uttar Pradesh", "Lucknow", "226014", "AB-", "plasma", 2, "urgent", "Pending", 26.7458, 80.9388),
            ("Kailash Chand", "Manish Chand", "+91 94142 13579", "Fortis Escorts", "OT Complex", "Rajasthan", "Jaipur", "302017", "B-", "whole_blood", 1, "scheduled", "Fulfilled", 26.8524, 75.8055),
        ]

        created_requests = []
        for pat, att, phone, hosp, ward, state, city, pin, bg, comp, units, urg, status, lat, lng in request_specs:
            req, _ = BloodRequest.objects.get_or_create(
                patient_name=pat,
                defaults={
                    'user': req_user,
                    'attendant_name': att,
                    'contact_phone': phone,
                    'hospital_name': hosp,
                    'ward': ward,
                    'state': state,
                    'city': city,
                    'pincode': pin,
                    'blood_group': bg,
                    'component_type': comp,
                    'units_needed': units,
                    'urgency': urg,
                    'status': status,
                    'lat': lat,
                    'lng': lng,
                }
            )
            created_requests.append(req)

        # 4. Responses and Donations for sample records
        kgmu_req = created_requests[1]
        amitabh_donor = created_donors[1]
        resp1, _ = RequestResponse.objects.get_or_create(
            request=kgmu_req,
            donor=amitabh_donor,
            defaults={
                'response_status': 'Confirmed',
                'confirmed_at': timezone.now(),
            }
        )

        fortis_req = created_requests[5]
        vikas_donor = created_donors[6]
        resp2, _ = RequestResponse.objects.get_or_create(
            request=fortis_req,
            donor=vikas_donor,
            defaults={
                'response_status': 'Donated',
                'confirmed_at': timezone.now() - timedelta(days=2),
                'donated_at': timezone.now() - timedelta(days=1),
                'din': '#DIN9124',
            }
        )
        Donation.objects.get_or_create(
            din='#DIN9124',
            defaults={
                'donor': vikas_donor,
                'request': fortis_req,
                'donation_date': date.today() - timedelta(days=1),
                'hospital_or_camp': fortis_req.hospital_name,
                'blood_group': vikas_donor.blood_group,
                'component': fortis_req.component_type,
                'units': 1,
            }
        )

        # 5. Camps (3 camps)
        camps_data = [
            ("Youth Voluntary Blood Drive", "Lions Club & Red Cross", "Jawaharlal Nehru Stadium Gate 2", "Delhi", date.today() + timedelta(days=4), "09:00 AM - 04:00 PM", 120, 48, "+91 98110 00111"),
            ("Hazratganj Community Donation Camp", "UDAAN NGO Lucknow Chapter", "GPO Park, Hazratganj", "Lucknow", date.today() + timedelta(days=7), "10:00 AM - 05:00 PM", 80, 22, "+91 94150 00222"),
            ("Pink City Mega Voluntary Drive", "Jaipur Blood Heroes Society", "Central Park Main Pavilion", "Jaipur", date.today() + timedelta(days=11), "08:30 AM - 03:30 PM", 150, 95, "+91 98290 00333"),
        ]
        for title, org, venue, city, c_date, c_time, slots, booked, phone in camps_data:
            Camp.objects.get_or_create(
                title=title,
                city=city,
                defaults={
                    'organizer': org,
                    'venue': venue,
                    'date': c_date,
                    'time': c_time,
                    'total_slots': slots,
                    'booked_slots': booked,
                    'contact_phone': phone,
                }
            )

        # 6. Wellness Tips (6 tips)
        tips_data = [
            ("pre", "Hydrate Heavily Before Donating", "रक्तदान से पहले पर्याप्त पानी पिएं", "Drink at least 500ml of water or fresh juice 30 minutes before your donation. Avoid caffeinated beverages as they can cause mild dehydration.", "रक्तदान से 30 मिनट पहले कम से कम 500 मिली पानी या ताज़ा जूस पिएं। कैफीन वाले पेय से बचें क्योंकि इससे निर्जलीकरण हो सकता है।"),
            ("pre", "Iron-Rich Balanced Meal", "आयरन युक्त संतुलित भोजन लें", "Eat a wholesome meal rich in iron like spinach, legumes, raisins, and jaggery 2-3 hours before donation. Do not donate on an empty stomach.", "रक्तदान से 2-3 घंटे पहले पालक, दालें, किशमिश और गुड़ जैसा पौष्टिक भोजन लें। खाली पेट कभी रक्तदान न करें।"),
            ("post", "Rest & Enjoy Refreshments", "15 मिनट आराम करें और तरल पदार्थ लें", "Stay seated for 10-15 minutes in the observation lounge and enjoy your juice and snack. Keep your arm elevated if you notice any mild bruising.", "रक्तदान के बाद 10-15 मिनट आराम कक्ष में बैठें, जूस और अल्पाहार लें। यदि हल्का नीलापन दिखे तो हाथ को थोड़ा ऊंचा रखें।"),
            ("post", "Avoid Strenuous Exercise", "भारी व्यायाम और वजन उठाने से बचें", "Refrain from lifting heavy weights, intense gym workouts, or driving long distances for the next 12 hours. Drink extra fluids throughout the day.", "अगले 12 घंटों तक भारी वजन उठाने, जिम करने या लंबी ड्राइविंग से बचें। पूरे दिन सामान्य से अधिक तरल पदार्थ पिएं।"),
            ("eligibility", "Hemoglobin & Weight Requirements", "हीमोग्लोबिन और वजन की अनिवार्यताएं", "Donors must weigh at least 45 kg (50 kg for platelet apheresis) and maintain a minimum hemoglobin level of 12.5 g/dL on a rapid fingerprick test.", "रक्तदाता का वजन कम से कम 45 किग्रा (प्लेटलेट्स के लिए 50 किग्रा) और हीमोग्लोबिन स्तर कम से कम 12.5 ग्राम/डीएल होना अनिवार्य है।"),
            ("eligibility", "Mandatory 90-Day Safe Cooldown", "90 दिन का अनिवार्य सुरक्षित अंतराल", "The National Blood Transfusion Council mandates a minimum 90-day rest interval between whole blood donations to allow your red blood cells and iron stores to fully replenish.", "राष्ट्रीय रक्त संचरण परिषद (NBTC) के अनुसार पूर्ण रक्तदान के बीच न्यूनतम 90 दिनों का अंतराल अनिवार्य है ताकि आयरन और रक्त कोशिकाएं पुनः सामान्य हो सकें।"),
        ]
        for cat, t_en, t_hi, b_en, b_hi in tips_data:
            WellnessTip.objects.get_or_create(
                title_en=t_en,
                category=cat,
                defaults={
                    'title_hi': t_hi,
                    'body_en': b_en,
                    'body_hi': b_hi,
                }
            )

        # 7. Blood Banks with Stocks (4 licensed blood banks)
        banks_data = [
            ("Rotary Blood Bank Central", "Tughlakabad Institutional Area", "Delhi", "+91 11 2995 5001", "BB-DL-2018-091", 28.5121, 77.2710, {"A+": 18, "A-": 4, "B+": 25, "B-": 6, "AB+": 9, "AB-": 2, "O+": 32, "O-": 5}),
            ("Red Cross Blood Center", "Red Cross Bhawan, 1 Golf Links", "Delhi", "+91 11 2371 1551", "BB-DL-2005-012", 28.5912, 77.2280, {"A+": 12, "A-": 2, "B+": 19, "B-": 3, "AB+": 6, "AB-": 1, "O+": 21, "O-": 4}),
            ("Charak Blood Center", "Chowk Near Medical College", "Lucknow", "+91 522 225 7540", "BB-UP-2016-044", 26.8710, 80.9150, {"A+": 14, "A-": 3, "B+": 28, "B-": 5, "AB+": 8, "AB-": 2, "O+": 24, "O-": 3}),
            ("Swasthya Kalyan Blood Bank", "Sitapura Industrial Area", "Jaipur", "+91 141 277 1777", "BB-RJ-2014-078", 26.7820, 75.8280, {"A+": 15, "A-": 2, "B+": 22, "B-": 4, "AB+": 7, "AB-": 1, "O+": 29, "O-": 4}),
        ]
        for name, addr, city, phone, lic, lat, lng, stock in banks_data:
            Partner.objects.get_or_create(
                name=name,
                city=city,
                defaults={
                    'type': 'blood_bank',
                    'status': 'verified',
                    'phone': phone,
                    'license_no': lic,
                    'hospital_or_org': addr,
                    'lat': lat,
                    'lng': lng,
                    'stock': stock,
                    'stock_updated_at': timezone.now() - timedelta(minutes=42),
                }
            )

        self.stdout.write(self.style.SUCCESS("UDAAN demo seed completed successfully!"))
