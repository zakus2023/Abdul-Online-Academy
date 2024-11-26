from django.shortcuts import render, redirect
import stripe.error
from api import serializer as api_serializer
from rest_framework_simplejwt.views import TokenObtainPairView

from rest_framework import generics, status, viewsets
from userauths.models import User, Profile
from rest_framework.permissions import AllowAny

import random
from rest_framework_simplejwt.tokens import RefreshToken

from rest_framework.response import Response
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.db.models import Sum
from django.http import Http404
from  django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from stripe.error import StripeError
from django.db import transaction
from decimal import Decimal
from rest_framework.exceptions import NotFound
from rest_framework.decorators import api_view
from django.db.models.functions import ExtractMonth, ExtractYear

from .models import Teacher, Category, Course, Variant, VariantItem, Question_Answer, Question_Answer_Message, Cart, CartOrder, CartOrderItem, Certificate, CompletedLessons, EnrolledCourse, Note, Review, Notification, Country, Coupon, WishList

import stripe

import requests
from datetime import datetime, timedelta
from django.db import models

from django.contrib.auth.hashers import check_password

stripe.api_key = settings.STRIPE_SECRET_KEY
PAYPAL_CLIENT_ID = settings.PAYPAL_CLIENT_ID
PAYPAL_SECRET_KEY = settings.PAYPAL_SECRET_KEY


# Create your views here.

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = api_serializer.MyTokenObtainPairSerializer

class RegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = api_serializer.RegisterSerializer


# ===================================================================

def generate_random_otp(Length=7):
    otp = ''.join([str(random.randint(0, 9)) for _ in range(Length)])
    return otp

class PasswordResetEmailVerifyAPIView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = api_serializer.UserSerializer

    def get_object(self):
        email = self.kwargs['email']
        user = User.objects.filter(email=email).first()

        if user:
            uuidb64 = user.pk
            refresh = RefreshToken.for_user(user)
            refresh_token = str(refresh.access_token)

            user.refresh_token = refresh_token
            user.otp = generate_random_otp()
            user.save()
                    
            
            link = f"http://localhost:5173/create-new-password/?otp={user.otp}&uuidb64={uuidb64}&refresh_token={refresh_token}"

            # send the email to the user when link is clicked

            context = {
                "link": link,
                "username": user.username
            }
            subject = "Password Reset Email"
            text_body = render_to_string("email/password_reset.txt", context)
            html_body = render_to_string("email/password_reset.html", context)

            msg = EmailMultiAlternatives(
                subject=subject,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.email],
                body=text_body
            )

            msg.attach_alternative(html_body, "text/html")
            msg.send()

            return user    
        else:
            # Return a response indicating the user was not found
            return Response({"error": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)
    
# This is for resetting the password
class PasswordChangeAPIView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = api_serializer.UserSerializer

    def create(self, request, *args, **kwargs):
        payload = request.data

        otp = payload['otp']
        uuidb64 = payload['uuidb64']
        password = payload['password']

        user = User.objects.get(id=uuidb64, otp=otp)
        if user:
            user.set_password(password)
            user.otp=""
            user.save()

            return Response({"message": "Password changed successfully"}, status=status.HTTP_201_CREATED)
        else:
            return Response({"message":"User does not exist"}, status=status.HTTP_404_NOT_FOUND)
        
# This is for changing the password
class ChangePasswordAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.UserSerializer
    permission_classes =[AllowAny]

    def create(self, request, *args, **kwargs):
        user_id = request.data['user_id']
        old_password = request.data['old_password']
        new_password = request.data["new_password"]

        user = User.objects.get(id=user_id)
        if user is not None:
            if check_password(old_password, user.password):
                user.set_password(new_password)
                user.save()
                return Response({"message": "Password Changed Successfully", "icon":"success"})
            else:
                return Response({"message":"Old password is incorrect", "icon":"warning"})
        else:
            return Response({"message":"User does not exist", "icon":"warning"})
        
        
class UserProfileAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = api_serializer.ProfileSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        user_id = self.kwargs['user_id']
        user = User.objects.get(id=user_id)

        profile = Profile.objects.get(user=user)

        return profile
                

#===========================================================================================================      

# VIEWS FOR COURSE, TEACHER, ORDER, REVIEW, PAYMENTs, CART etc

class CategoryListAPIView(generics.ListAPIView):
    queryset = Category.objects.filter(active=True)
    serializer_class = api_serializer.CategorySerializer
    permission_classes = [AllowAny]

# class CourseListAPIView(generics.ListAPIView):
#     queryset = Course.objects.filter(
#         platform_course_status = "Approved",
#         teacher_course_status = "Published"
#     )
#     print(queryset)  # Add logging or debugging to confirm output
#     serializer_class = api_serializer.CourseSerializer
#     permission_classes = [AllowAny]
class CourseListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Course.objects.filter(
            platform_course_status="Approved",
            teacher_course_status="Published"
        )
        print(queryset)  # Now this will output the queryset when accessed
        return queryset

class CourseDetailAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        slug = self.kwargs['slug'] # Get the slug from the url and use it to filter the course in the next command below
        course = Course.objects.get(slug=slug, platform_course_status="Approved", teacher_course_status="Published") # get a single course based on slug, platformstatus and teacher course status
        return course

class CartAPIView(generics.CreateAPIView):
    queryset = Cart.objects.all()
    serializer_class = api_serializer.CartSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        course_id = request.data['course_id']
        user_id = request.data['user_id']
        price = request.data['price']
        country_name = request.data['country_name']
        cart_id = request.data['cart_id']

        print("course_id ==========", course_id)
        print("user_id ==========", user_id)
        print("price ==========", price)
        print("country ==========", country_name)
        print("cart_id ==========", cart_id)

        if course_id != "undefined":
            course = Course.objects.filter(course_id=course_id).first()
            print(course)
        else:
            course= None

        if user_id != "undefined":

            user = User.objects.filter(id=user_id).first()
        else:
            user = None

        try:
            country_object = Country.objects.filter(name=country_name).first()
            country = country_object.name
        except:
            country_object = None
            country = "Canada"
        
        if country_object:
            tax_rate = country_object.tax_rate /100
        else:
            tax_rate = 0

        cart = Cart.objects.filter(cart_id=cart_id, course=course).first()

        if cart:
            cart.course = course
            cart.user = user
            cart.price = price
            cart.tax_fee = Decimal(price) * Decimal(tax_rate)
            cart.country = country
            cart.cart_id = cart_id

            cart.total = Decimal(cart.price) + Decimal(cart.tax_fee)
            cart.save()

            return Response({"message": "Cart updated Successfully!! "}, status=status.HTTP_200_OK)
        else:
            cart = Cart()

            cart.course = course
            cart.user = user
            cart.price = price
            cart.tax_fee = Decimal(price) * Decimal(tax_rate)
            cart.country = country
            cart.cart_id = cart_id

            cart.total = Decimal(cart.price) + Decimal(cart.tax_fee)
            cart.save()

            return Response({"message": "Item added to the Cart "}, status=status.HTTP_201_CREATED)
        
class CartListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.CartSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        cart_id = self.kwargs['cart_id']

        queryset = Cart.objects.filter(cart_id=cart_id)

        return queryset


class CartItemDeleteAPIView(generics.DestroyAPIView):
    serializer_class = api_serializer.CartSerializer

    def get_object(self):
        cart_id = self.kwargs['cart_id']
        item_id = self.kwargs['item_id']

        return Cart.objects.filter(cart_id=cart_id, id=item_id).first()
    
class CartStatsAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.CartSerializer
    permission_classes = [AllowAny]
    lookup_field = 'cart_id'

    def get_queryset(self):
        cart_id = self.kwargs['cart_id']
        queryset = Cart.objects.filter(cart_id=cart_id)
        return queryset
    
    def get(self, requset, *args, **kwargs):
        queryset = self.get_queryset() # assign whatever you get from the above def to the variable queryset

        total_price = 0.00
        total_tax = 0.00
        grand_total = 0.00

        for cart_item in queryset:
            total_price += float(self.calculate_price(cart_item)) 
            total_tax += float(self.calculate_tax(cart_item))
            grand_total += round(float(self.calculate_total(cart_item)), 2)

        data = {
            "price": total_price,
            "tax": total_tax,
            "total": grand_total

        }

        return Response(data)

    def calculate_price(self, cart_item):
        return cart_item.price
    
    def calculate_tax(self, cart_item):
        return cart_item.tax_fee
    
    def calculate_total(self, cart_item):
        return cart_item.total
    

class CreateOrderAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.CartOrderSerializer
    permission_classes = [AllowAny]
    queryset = CartOrder.objects.all()

    def create(self, request, *args, **kwargs):
        full_name = request.data['full_name']
        email = request.data['email']
        country = request.data['country']
        cart_id = request.data['cart_id']
        user_id = request.data['user_id']

        if user_id !=0:
            user = User.objects.get(id=user_id)
        else:
            user = None

        cart_items = Cart.objects.filter(cart_id=cart_id)

        total_price = Decimal(0.00)
        total_tax = Decimal(0.00)
        total_initial_total = Decimal(0.00)
        grand_total = Decimal(0.00)

        order = CartOrder.objects.create(
            full_name=full_name,
            email = email,
            country = country,
            student =user
        )

        for cart_item in cart_items:
            CartOrderItem.objects.create(
                order=order,
                course=cart_item.course,
                price =cart_item.price,
                tax_fee = cart_item.tax_fee,
                total = cart_item.total,
                initial_total = cart_item.total,
                teacher = cart_item.course.teacher

            )

            total_price += Decimal(cart_item.price)
            total_tax += Decimal(cart_item.tax_fee)
            total_initial_total += Decimal(cart_item.total)
            grand_total += Decimal(cart_item.total)

            order.teachers.add(cart_item.course.teacher)

        order.sub_total = total_price
        order.tax_fee = total_tax
        order.initial_total = total_initial_total
        order.total = grand_total
        order.save()

        return Response ({"message": "Order Created Successfully", "order_id":order.order_id, "user_id":user_id}, status=status.HTTP_201_CREATED)

class CheckoutAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.CartOrderSerializer
    permission_classes = [AllowAny]
    queryset = CartOrder.objects.all()
    lookup_field = 'order_id'


class CouponApplyAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.CouponSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        order_id = request.data.get('order_id')
        coupon_code = request.data.get('coupon_code')

        print("Coupon Code",coupon_code, "Coupon Id", order_id)

        try:
            # Fetch the order and coupon
            order = CartOrder.objects.get(order_id=order_id)
            coupon = Coupon.objects.get(code=coupon_code)
        except CartOrder.DoesNotExist:
            return Response({"message": "Order not found", "icon": "error"}, status=status.HTTP_404_NOT_FOUND)
        except Coupon.DoesNotExist:
            return Response({"message": "Coupon not found", "icon": "error"}, status=status.HTTP_404_NOT_FOUND)

        # Apply coupon to items related to the specific teacher
        order_items = CartOrderItem.objects.filter(order=order, teacher=coupon.teacher)
        
        if not order_items.exists():
            return Response({"message": "No items associated with the coupon's teacher"}, status=status.HTTP_400_BAD_REQUEST)

        total_discount = 0
        coupon_already_applied = False

        for item in order_items:
            # Check if the coupon has already been applied
            if coupon in item.coupons.all():
                coupon_already_applied = True
                continue
            
            # Apply the discount
            discount = item.total * coupon.discount / 100
            item.total -= discount
            item.price -= discount
            item.saved += discount
            item.applied_coupon = True
            item.coupons.add(coupon)
            item.save()

            # Accumulate the total discount for the order
            total_discount += discount

        if coupon_already_applied and total_discount == 0:
            return Response({"message": "Coupon has already been applied", "icon": "warning"}, status=status.HTTP_200_OK)

        # Apply the discount to the order totals
        order.total -= total_discount
        order.sub_total -= total_discount
        order.saved += total_discount
        order.coupons.add(coupon)
        order.save()

        # Mark the coupon as used by the student
        if order.student:
            coupon.used_by.add(order.student)

        return Response({"message": "Coupon applied successfully", "icon": "success"}, status=status.HTTP_201_CREATED)



class StripeCheckoutAPIView(generics.CreateAPIView):
        serializer_class = api_serializer.CartOrderSerializer
        permission_classes = [AllowAny]

        def create(self, request, *args, **kwargs):
            
            order_id = self.kwargs['order_id']
            order = CartOrder.objects.get(order_id=order_id)

            if not order:
                return Response({"message": "Order not found"}, status=status.HTTP_404_NOT_FOUND)
            try:
                pass
                # make sure you run pip install stripe if you have not done that already
                # go to stripe dashboard and copy the secret key for your stripe
                # add the secret key to the .env and use it in the settings.py as in file
                # import stripe at the top of this of file
                # add stripe.api_key =  ... after that
                # SITE URLs

                # Configure the SITE URLs in the .env and use it in the settings.py as foolows:
                # FRONTEND_SITE_URL = env("FRONTEND_SITE_URL")
                # BACKEND_SITE_URL = env("BACKEND_SITE_URL")

                checkout_session = stripe.checkout.Session.create(
                    customer_email= order.email,
                    payment_method_types=['card'],
                    line_items=[
                        {
                            'price_data':{
                                'currency':'cad',
                                'product_data': {
                                    'name': order.full_name,
                                },
                                'unit_amount': int(order.total * 100),
                            },
                            'quantity': 1,
                        }
                    ],
                    mode='payment',
                    success_url=settings.FRONTEND_SITE_URL + 'payment-success/' + order.order_id + '?session_id={CHECKOUT_SESSION_ID}',
                    cancel_url=settings.FRONTEND_SITE_URL + 'payment-failed/',
                )

                print(checkout_session)

                order.stripe_session_id = checkout_session.id

                return redirect(checkout_session.url)    

            except stripe.error.StripeError as e:
                return Response({f"message":"Oops! Something went wrong. Error: {str(e)}"})
            

# PAYPAL CONFIG
# Make sure to get the paypal Client Id and Secret key from paypal dashboard: Developer
# Configure it in the .env and use it in the settings.py as in file
# Also call the clientid and secret key on top of this file

# def get_access_token(client_id, secret_key):
#     token_url = "https://api.sandbox.paypal.com/v1/oauth/token"

#     data = {'grant_type':'client_credentials'}
#     auth = (client_id, secret_key)
#     # nmake sure to import requests
#     response = requests.post(token_url, data=data, auth=auth)

#     if response.status_code == 200:
#         print("Access Token ====>", response.json()['access_token'])

#         return response.json()['access_token']
#     else:
#         raise Exception(f"Failed to get access token from paypal {response.status_code}")

def get_access_token(client_id, secret_key):
    token_url = "https://api.sandbox.paypal.com/v1/oauth2/token"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = {'grant_type': 'client_credentials'}
    auth = (client_id, secret_key)

    response = requests.post(token_url, headers=headers, data=data, auth=auth)

    if response.status_code == 200:
        access_token = response.json().get('access_token')
        print("Access Token ====>", access_token)
        return access_token
    else:
        raise Exception(f"Failed to get access token from PayPal. Status Code: {response.status_code}, Response: {response.text}")
    

class PaymentSuccessAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.CartOrderSerializer
    queryset = CartOrder.objects.all()

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        # Get payment and order-related information from the request data
        order_id = request.data['order_id']
        session_id = request.data['session_id']
        paypal_order_id = request.data['paypal_order_id']

        order = CartOrder.objects.get(order_id=order_id)  # Get the CartOrder instance based on order_id
        order_items = CartOrderItem.objects.filter(order=order)  # Retrieve items associated with the order

        # Handling PayPal payment success
        if paypal_order_id and paypal_order_id != "null":  # Check for valid PayPal order ID
            paypal_api_url = f"https://api.sandbox.paypal.com/v2/checkout/orders/{paypal_order_id}"
            headers = {
                'Content-Type': "application/json",
                "Authorization": f"Bearer {get_access_token(PAYPAL_CLIENT_ID, PAYPAL_SECRET_KEY)}"
            }

            try:
                response = requests.get(paypal_api_url, headers=headers)

                # Check if the response status is OK (200)
                if response.status_code == 200:
                    paypal_order_data = response.json()
                    paypal_payment_status = paypal_order_data.get('status')

                    # Verify if the payment status is 'COMPLETED'
                    if paypal_payment_status == "COMPLETED":
                        if order.payment_status == "Processing":  # Only proceed if payment status is "Processing"
                            order.payment_status = "Paid"  # Update payment status to "Paid"
                            order.save()

                            # Clear cart items for the user
                            Cart.objects.filter(user=order.student).delete()

                            # Avoid duplicate notifications and enrollments by checking their existence
                            if not Notification.objects.filter(user=order.student, order=order, type="Course Enrolment Completed").exists():
                                Notification.objects.create(
                                    user=order.student,
                                    order=order,
                                    type="Course Enrolment Completed"
                                )

                            # Create Notification and EnrolledCourse for each teacher and course item
                            for order_i in order_items:
                                # Check specifically for unique notifications per order item
                                if not Notification.objects.filter(
                                    teacher=order_i.course.teacher,
                                    order=order,
                                    order_item=order_i,
                                    type="New Order"
                                ).exists():
                                    Notification.objects.create(
                                        teacher=order_i.course.teacher,
                                        order=order,
                                        order_item=order_i,
                                        type="New Order",
                                    )

                                # Similarly, check for unique enrollments
                                if not EnrolledCourse.objects.filter(
                                    course=order_i.course,
                                    user=order.student,
                                    teacher=order_i.course.teacher,
                                    order_item=order_i
                                ).exists():
                                    EnrolledCourse.objects.create(
                                        course=order_i.course,
                                        user=order.student,
                                        teacher=order_i.course.teacher,
                                        order_item=order_i,
                                    )

                            return Response({"message": "Payment successful"})
                        else:
                            return Response({"message": "You have already made the payment. Thank you!"})
                    else:
                        print(f"PayPal payment status: {paypal_payment_status}")
                        return Response({"message": "Payment could not be completed."})

                else:
                    error_message = response.json().get('message', 'Unknown error')
                    print(f"PayPal API Error ({response.status_code}): {error_message}")
                    return Response({"message": "An error occurred while verifying payment with PayPal."})
            
            except requests.exceptions.RequestException as e:
                print(f"Request error: {e}")
                return Response({"message": "Error occurred while contacting PayPal API."})

        # Stripe payment success
        if session_id and session_id != "null":  # Check if session_id is valid
            try:
                session = stripe.checkout.Session.retrieve(session_id)

                # Check if the payment status is indeed "paid"
                if session.payment_status.lower() == "paid":
                    if order.payment_status == "Processing":  # Only proceed if payment status is "Processing"
                        order.payment_status = "Paid"
                        order.save()

                        Cart.objects.filter(user=order.student).delete()

                        if not Notification.objects.filter(user=order.student, order=order, type="Course Enrolment Completed").exists():
                            Notification.objects.create(
                                user=order.student,
                                order=order,
                                type="Course Enrolment Completed"
                            )

                        for order_i in order_items:
                            # Check specifically for unique notifications per order item
                            if not Notification.objects.filter(
                                teacher=order_i.course.teacher,
                                order=order,
                                order_item=order_i,
                                type="New Order"
                            ).exists():
                                Notification.objects.create(
                                    teacher=order_i.course.teacher,
                                    order=order,
                                    order_item=order_i,
                                    type="New Order",
                                )

                            # Similarly, check for unique enrollments
                            if not EnrolledCourse.objects.filter(
                                course=order_i.course,
                                user=order.student,
                                teacher=order_i.course.teacher,
                                order_item=order_i
                            ).exists():
                                EnrolledCourse.objects.create(
                                    course=order_i.course,
                                    user=order.student,
                                    teacher=order_i.course.teacher,
                                    order_item=order_i,
                                )

                        return Response({"message": "Payment successful"})
                    else:
                        return Response({"message": "You have already made the payment. Thank you!"})
                else:
                    return Response({"message": "Payment could not be completed"})
            
            except StripeError as e:
                print(f"Stripe error: {e}")
                return Response({"message": "Error occurred during payment processing"})

        else:
            return Response({"message": "Oops! Something went wrong"})


        

class SearchCourseAPIView(generics.ListAPIView):
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        query = self.request.GET.get('query')
        return Course.objects.filter(title__icontains=query, platform_course_status="Approved", teacher_course_status="Published")
    


#===========================================================================================================

# Student Stats APIs

class StudentSummaryAPIView(generics.ListAPIView):
    serializer_class = api_serializer.StudentSummarySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user = User.objects.get(id=user_id)

        total_courses = EnrolledCourse.objects.filter(user=user).count()
        completed_lessons = CompletedLessons.objects.filter(user=user).count()
        certs = Certificate.objects.filter(user=user).count()

        return [{
            "total_courses": total_courses,
            "completed_lessons": completed_lessons,
            "certs": certs 
        }]
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    

class StudentCourseListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.EnrolledCourseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        user = User.objects.get(id=user_id)
        return EnrolledCourse.objects.filter(user=user)

class StudentCourseDetailAPIView(generics.RetrieveAPIView):
    serializer_class = api_serializer.EnrolledCourseSerializer
    permission_classes = [AllowAny]
    lookup_field = 'enrollment_id'

    def get_object(self):
        user_id = self.kwargs['user_id']
        enrollment_id = self.kwargs['enrollment_id']
        user = User.objects.get(id=user_id)
        enrolment = EnrolledCourse.objects.get(user=user, enrollment_id=enrollment_id)
        return enrolment
    

class StudentCourseCompletedAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.CompletedLessonsSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        user_id = request.data['user_id']
        course_id = request.data['course_id']
        variant_item_id = request.data['variant_item_id']

        user = User.objects.get(id=user_id)
        course = Course.objects.get(id=course_id)
        variant_item = VariantItem.objects.get(variant_item_id=variant_item_id)

        completed_lessons = CompletedLessons.objects.filter(user=user, course=course, variant_item=variant_item).first()

        if completed_lessons:
            completed_lessons.delete()
            return Response({"message":"Course marked as not completed"})
        else:
            CompletedLessons.objects.create(user=user, course=course, variant_item=variant_item)
            return Response({"message":"Course marked as completed"})
        
class StudentNoteCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.NoteSerializer
    permission_classes = [AllowAny]


    def get_queryset(self):
        user_id = self.kwargs['user_id']
        enrollment_id = self.kwargs['enrollment_id']

        user = User.objects.get(id=user_id)
        enrolled_course = EnrolledCourse.objects.get(enrollment_id=enrollment_id)

        note = Note.objects.filter(user=user, course=enrolled_course.course)
        return note

    def create(self, request, *args, **kwargs):
        user_id = request.data['user_id']
        enrollment_id = request.data['enrollment_id']
        title = request.data['title']
        note = request.data['note']

        user = User.objects.get(id=user_id)
        enrolled_course = EnrolledCourse.objects.get(enrollment_id=enrollment_id)

        Note.objects.create(user=user, course=enrolled_course.course, note=note, title=title)

        return Response({"message":"Note created successfully"}, status=status.HTTP_201_CREATED)



class StudentNoteDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = api_serializer.NoteSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        user_id = self.kwargs['user_id']
        enrollment_id = self.kwargs['enrollment_id']
        note_id = self.kwargs['note_id']

        try:
            # Retrieve the user and enrolled course
            user = User.objects.get(id=user_id)
            enrolled_course = EnrolledCourse.objects.get(enrollment_id=enrollment_id)

            # Retrieve the existing note
            note = Note.objects.get(user=user, course=enrolled_course.course, note_id=note_id)
            return note

        except User.DoesNotExist:
            raise NotFound("User not found.")
        except EnrolledCourse.DoesNotExist:
            raise NotFound("Enrolled course not found.")
        except Note.DoesNotExist:
            raise NotFound("Note not found.")
        
class StudentCourseReviewCreateAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.ReviewSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        user_id = request.data['user_id']
        course_id = request.data['course_id']
        rating = request.data['rating']
        review = request.data['review']

        user = User.objects.get(id=user_id)
        course = Course.objects.get(course_id=course_id)

        Review.objects.create(
            user=user,
            course=course,
            review=review,
            rating=rating,
            active=True  # Ensure review is active if it should display in course reviews
        )

        return Response({"message":"Review Successful"})


        
class StudentReviewCourseUpdateAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = api_serializer.ReviewSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        user_id = self.kwargs['user_id']
        review_id = self.kwargs['review_id']

        user = User.objects.get(id=user_id)
        review = Review.objects.get(id=review_id, user=user)

        return review


class StudentWishListCreateListAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.WishListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['user_id']

        user = User.objects.get(id=user_id)
        wishlists = WishList.objects.filter(user=user)
        return wishlists
    
    def create(self, request, *args, **kwargs):
        user_id = request.data['user_id']
        course_id = request.data['course_id']

        user = User.objects.get(id=user_id)
        course = Course.objects.get(course_id=course_id)

        wishlist = WishList.objects.filter(user=user, course=course).first()
        if wishlist:
            wishlist.delete()
            return Response({"message":"Wishlist Deleted"}, status=status.HTTP_200_OK)
        else:
            WishList.objects.create(
                user=user,
                course=course
            )

            return Response({"message":"Course Added to Wishlist"}, status=status.HTTP_201_CREATED)


    
class QuestionAndAnswerListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.Question_AnswerSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        # Get the course_id from the URL and filter the queryset
        course_id = self.kwargs['course_id']
        return Question_Answer.objects.filter(course_id=course_id)
    
    def create(self, request, *args, **kwargs):
        course_id = request.data.get('course_id')
        user_id = request.data.get('user_id')
        title = request.data.get('title')
        message = request.data.get('message')

        # Fetch user and course instances
        user = User.objects.get(id=user_id)
        course = Course.objects.get(course_id=course_id)

        # Create Question_Answer and Question_Answer_Message entries
        question = Question_Answer.objects.create(
            course=course,
            user=user,
            title=title
        )

        Question_Answer_Message.objects.create(
            course=course,
            user=user,
            message=message,
            question=question
        )

        return Response({"message": "Group Conversation started"}, status=status.HTTP_201_CREATED)


class QuestionAnswerMessageSendAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.Question_Answer_MessageSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        course_id = request.data.get('course_id')
        user_id = request.data.get('user_id')
        qa_id = request.data.get('qa_id')
        message = request.data.get('message')

         # Fetch user and course instances
        user = User.objects.get(id=user_id)
        course = Course.objects.get(id=course_id)

        question = Question_Answer.objects.get(qa_id=qa_id)

        Question_Answer_Message.objects.create(
            course=course,
            user=user,
            message=message,
            question=question
        )

        question_serializer = api_serializer.Question_AnswerSerializer(question)
        return Response({"meessage":"Message sent", "question": question_serializer.data})



class TeacherSummaryAPIView(generics.ListAPIView):
    serializer_class = api_serializer.TeacherSummarySerializer
    permission_class = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = Teacher.objects.get(id=teacher_id)

        one_month_ago = datetime.today() - timedelta(days=28)

        total_courses = Course.objects.filter(teacher=teacher).count()
        total_revenue = CartOrderItem.objects.filter(teacher=teacher, order__payment_status="Paid").aggregate(total_revenue=models.Sum("price"))["total_revenue"] or 0

        monthly_revenue = CartOrderItem.objects.filter(teacher=teacher, order__payment_status="Paid", date__gte=one_month_ago).aggregate(total_revenue=models.Sum("price"))["total_revenue"] or 0

        enrolled_course = EnrolledCourse.objects.filter(teacher=teacher)
        unique_student_ids = set()
        students = []

        for course in enrolled_course:
            if course.user_id not in unique_student_ids:
                user = User.objects.get(id=course.user_id)
                student = {
                    "full_name":user.profile.full_name,
                    "image": user.profile.image.url,
                    "country": user.profile.country,
                    "date": course.date

                }

                students.append(student)

                unique_student_ids.add(course.user_id)

        return [{
            "total_courses":total_courses,
            "total_students":len(students),
            "total_revenue":total_revenue,
            "monthly_revenue":monthly_revenue
        }]
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class TeacherCourseListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = Teacher.objects.get(id=teacher_id)

        return Course.objects.filter(teacher=teacher)
    

class TeacherReviewListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.ReviewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        try:
            teacher = Teacher.objects.get(id=teacher_id)
        except Teacher.DoesNotExist:
            raise Http404("Teacher not found")
        
        return Review.objects.filter(course__teacher=teacher)

class TeacherReviewDetailAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = api_serializer.ReviewSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        teacher_id = self.kwargs['teacher_id']
        review_id = self.kwargs['review_id']

        teacher = Teacher.objects.get(id=teacher_id)       
        return Review.objects.get(course__teacher=teacher, id=review_id)
    
class TeacherStudentListAPIView(viewsets.ViewSet):
    def list(self, request, teacher_id=None):
        teacher = Teacher.objects.get(id=teacher_id)

        enrolled_course = EnrolledCourse.objects.filter(teacher=teacher)
        unique_student_ids = set()
        students = []

        for course in enrolled_course:
            if course.user_id not in unique_student_ids:
                user = User.objects.get(id=course.user_id)
                student = {
                    "full_name":user.profile.full_name,
                    "image": user.profile.image.url,
                    "country": user.profile.country,
                    "date": course.date

                }

                students.append(student)

                unique_student_ids.add(course.user_id)
        return Response(students)
@api_view(['GET'])
def TeacherMonthlyEarningAPIView(request, teacher_id):
    try:
        teacher = Teacher.objects.get(id=teacher_id)
        
        # Fetch monthly earnings with both year and month
        monthly_earning_tracker = (
            CartOrderItem.objects
            .filter(teacher=teacher, order__payment_status="Paid")
            .annotate(year=ExtractYear("date"), month=ExtractMonth("date"))
            .values("year", "month")
            .annotate(total_earning=Sum("price"))
            .order_by("year", "month")
        )

        return Response(monthly_earning_tracker)

    except Teacher.DoesNotExist:
        return Response({"error": "Teacher not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

class TeacherBestSellingCourseAPIView(viewsets.ViewSet):
    def list(self, request, teacher_id):
        teacher = Teacher.objects.get(id=teacher_id)
        courses_with_total_price = []
        courses = Course.objects.filter(teacher=teacher)

        for course in courses:
            revenue = course.enrolledcourse_set.aggregate(total_price=models.Sum("order_item__price"))["total_price"] or 0

            sales = course.enrolledcourse_set.count()

            courses_with_total_price.append({
                'course_mage':course.image.url,
                "course_title": course.title,
                "revenue": revenue,
                "sales": sales
            })

        return Response(courses_with_total_price)

class TeacherCourseOrdersListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.CartOrderItemSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = Teacher.objects.get(id=teacher_id)

        return CartOrderItem.objects.filter(teacher=teacher)

class TeacherQuestionAnswerAPIView(generics.ListAPIView):
    serializer_class = api_serializer.Question_AnswerSerializer
    permission_classes= [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = Teacher.objects.get(id=teacher_id)

        return Question_Answer.objects.filter(course__teacher=teacher)
    
class TeacherCouponListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = api_serializer.CouponSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = Teacher.objects.get(id=teacher_id)

        return Coupon.objects.filter(teacher=teacher)

class TeacherCouponDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = api_serializer.CouponSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        teacher_id = self.kwargs['teacher_id']
        coupon_id = self.kwargs['coupon_id']
        teacher = Teacher.objects.get(id=teacher_id)

        return Coupon.objects.get(teacher=teacher, id=coupon_id)
    
class TeacherNotificationListAPIView(generics.ListAPIView):
    serializer_class = api_serializer.NotificationSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        teacher_id = self.kwargs['teacher_id']
        teacher = Teacher.objects.get(id=teacher_id)
        return Notification.objects.filter(teacher=teacher, seen=False)
    
class TeacherNotificationDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = api_serializer.NotificationSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        teacher_id = self.kwargs['teacher_id']
        notification_id = self.kwargs['notification_id']
        teacher = Teacher.objects.get(id=teacher_id)

        return Notification.objects.get(teacher=teacher, id=notification_id)
    

class CourseCreateAPIView(generics.CreateAPIView):
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]
    queryset = Course.objects.all()

    def perform_create(self, serializer):
        # Save the course instance first
        course_instance = serializer.save()

        variant_data = []
        for key, value in self.request.data.items():
            if key.startswith('variant') and '[variant_title]' in key:
                index = key.split('[')[1].split(']')[0]
                title = value

                # Prepare a dictionary for the variant data
                variant_data_entry = {"title": title}
                item_data_list = []
                current_item = {}

                for item_key, item_value in self.request.data.items():
                    if f'variants[{index}][items]' in item_key:
                        field_name = item_key.split('[')[-1].split(']')[0]
                        if field_name == 'title' and current_item:
                            item_data_list.append(current_item)
                            current_item = {}
                        current_item.update({field_name: item_value})
                
                if current_item:
                    item_data_list.append(current_item)

                variant_data.append({'variant_data': variant_data_entry, 'variant_item_data': item_data_list})
        
        # Create variants and their items
        for data_entry in variant_data:
            variant = Variant.objects.create(
                title=data_entry['variant_data']['title'],
                course=course_instance
            )

            def strtobool(val):
                val = val.lower()
                if val in ("yes", "y", "true", "t", "1"):
                    return True
                elif val in ("no", "n", "false", "f", "0"):
                    return False
                else:
                    raise ValueError(f"Invalid truth value: {val}")

            # Process each item in the variant
            for item_data in data_entry['variant_item_data']:
                preview_value = item_data.get("preview")
                preview = bool(strtobool(str(preview_value))) if preview_value is not None else False
                VariantItem.objects.create(
                    variant=variant,
                    title=item_data.get("title"),
                    description=item_data.get("description"),
                    file=item_data.get("file"),
                    preview=preview,
                )


    def save_nested_data(self, course_instance, serializer_class, data):
        serializer = serializer_class(data=data, many=True, context={"course_instance": course_instance})
        serializer.is_valid(raise_exception=True)
        serializer.save(course=course_instance)       


class CourseUpdateAPIView(generics.RetrieveUpdateAPIView):
    querysect = Course.objects.all()
    serializer_class = api_serializer.CourseSerializer
    permisscion_classes = [AllowAny]

    def get_object(self):
        teacher_id = self.kwargs['teacher_id']
        course_id = self.kwargs['course_id']

        teacher = Teacher.objects.get(id=teacher_id)
        course = Course.objects.get(course_id=course_id)

        return course
    
    def update(self, request, *args, **kwargs):
        course = self.get_object()
        serializer = self.get_serializer(course, data=request.data)
        serializer.is_valid(raise_exception=True)

        if "image" in request.data and isinstance(request.data['image'], InMemoryUploadedFile):
            course.image = request.data['image']
        elif 'image' in request.data and str(request.data['image']) == "No File":
            course.image = None
        
        if 'file' in request.data and not str(request.data['file']).startswith("http://"):
            course.file = request.data['file']

        if 'category' in request.data['category'] and request.data['category'] != 'NaN' and request.data['category'] != "undefined":
            category = api_models.Category.objects.get(id=request.data['category'])
            course.category = category

        self.perform_update(serializer)
        self.update_variant(course, request.data)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def update_variant(self, course, request_data):
        for key, value in request_data.items():
            if key.startswith("variants") and '[variant_title]' in key:

                index = key.split('[')[1].split(']')[0]
                title = value

                id_key = f"variants[{index}][variant_id]"
                variant_id = request_data.get(id_key)

                variant_data = {'title': title}
                item_data_list = []
                current_item = {}

                for item_key, item_value in request_data.items():
                    if f'variants[{index}][items]' in item_key:
                        field_name = item_key.split('[')[-1].split(']')[0]
                        if field_name == "title":
                            if current_item:
                                item_data_list.append(current_item)
                            current_item = {}
                        current_item.update({field_name: item_value})
                    
                if current_item:
                    item_data_list.append(current_item)

                existing_variant = course.variant_set.filter(id=variant_id).first()

                if existing_variant:
                    existing_variant.title = title
                    existing_variant.save()

                    def strtobool(val):
                        val = val.lower()
                        if val in ("yes", "y", "true", "t", "1"):
                            return True
                        elif val in ("no", "n", "false", "f", "0"):
                            return False
                        else:
                            raise ValueError(f"Invalid truth value: {val}")

                    for item_data in item_data_list[1:]:
                        preview_value = item_data.get("preview")
                        preview = bool(strtobool(str(preview_value))) if preview_value is not None else False

                        variant_item = VariantItem.objects.filter(variant_item_id=item_data.get("variant_item_id")).first()

                        if not str(item_data.get("file")).startswith("http://"):
                            if item_data.get("file") != "null":
                                file = item_data.get("file")
                            else:
                                file = None
                            
                            title = item_data.get("title")
                            description = item_data.get("description")

                            if variant_item:
                                variant_item.title = title
                                variant_item.description = description
                                variant_item.file = file
                                variant_item.preview = preview
                            else:
                                variant_item = VariantItem.objects.create(
                                    variant=existing_variant,
                                    title=title,
                                    description=description,
                                    file=file,
                                    preview=preview
                                )
                        
                        else:
                            title = item_data.get("title")
                            description = item_data.get("description")

                            if variant_item:
                                variant_item.title = title
                                variant_item.description = description
                                variant_item.preview = preview
                            else:
                                variant_item = VariantItem.objects.create(
                                    variant=existing_variant,
                                    title=title,
                                    description=description,
                                    preview=preview
                                )
                        
                        variant_item.save()

                else:
                    new_variant = Variant.objects.create(
                        course=course, title=title
                    )
                    def strtobool(val):
                        val = val.lower()
                        if val in ("yes", "y", "true", "t", "1"):
                            return True
                        elif val in ("no", "n", "false", "f", "0"):
                            return False
                        else:
                            raise ValueError(f"Invalid truth value: {val}")

                    for item_data in item_data_list:
                        preview_value = item_data.get("preview")
                        preview = bool(strtobool(str(preview_value))) if preview_value is not None else False

                        VariantItem.objects.create(
                            variant=new_variant,
                            title=item_data.get("title"),
                            description=item_data.get("description"),
                            file=item_data.get("file"),
                            preview=preview,
                        )

    def save_nested_data(self, course_instance, serializer_class, data):
        serializer = serializer_class(data=data, many=True, context={"course_instance": course_instance})
        serializer.is_valid(raise_exception=True)
        serializer.save(course=course_instance) 



    # ==============================================
class TeacherCourseDetailAPIView(generics.RetrieveDestroyAPIView):
    serializer_class = api_serializer.CourseSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        course_id = self.kwargs['course_id']
        return Course.objects.get(course_id=course_id)

class CourseVariantDeleteAPIView(generics.DestroyAPIView):
    serializer_class = api_serializer.VariantSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        variant_id = self.kwargs['variant_id']
        teacher_id = self.kwargs['teacher_id']
        course_id = self.kwargs['course_id']

        teacher = Teacher.objects.get(id=teacher_id)
        course = Course.objects.get(course_id=course_id, teacher=teacher)

        return Variant.objects.get(variant_id=variant_id, course=course)

class CourseVariantItemDeleteAPIView(generics.DestroyAPIView):
    serializer_class = api_serializer.VariantItemSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        variant_id = self.kwargs['variant_id']
        variant_item_id = self.kwargs['variant_item_id']
        teacher_id = self.kwargs['teacher_id']
        course_id = self.kwargs['course_id']

        print(f"Variant id: {variant_id} variant item id :{variant_item_id}")

        teacher = Teacher.objects.get(id=teacher_id)
        course = Course.objects.get(course_id=course_id, teacher=teacher)

        # Check if course and teacher are fetched correctly
        print(f"Teacher: {teacher}, Course: {course}")

        variant = Variant.objects.get(variant_id=variant_id, course=course)
        print(f"variant: {variant}")
        

        return VariantItem.objects.get(variant_item_id=variant_item_id, variant=variant)




    
