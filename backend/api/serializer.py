from rest_framework import serializers
from userauths.models import User, Profile
from .models import Teacher, Category, Course, Variant, VariantItem, Question_Answer, Question_Answer_Message, Cart, CartOrder, CartOrderItem, Certificate, CompletedLessons, EnrolledCourse, Note, Review, Notification, Country, Coupon, WishList

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from django.contrib.auth.password_validation import validate_password

# =========================================================================================
# REGISTRATION AND AUTHENTICATION


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        token['email'] = user.email
        token['full_name'] = user.full_name
        token['username'] = user.username
        
        # Safely assign teacher_id only if user has a teacher associated
        if hasattr(user, 'teacher') and user.teacher is not None:
            token['teacher_id'] = user.teacher.id
        else:
            token['teacher_id'] = 0  # No associated teacher

        return token

    
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['full_name', 'email', 'password', 'confirm_password']

    def validate(self, attr):
        if attr['password'] != attr['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords do not matct."})
        return attr
        
    def create(self, validated_data):
        user = User.objects.create(
            full_name= validated_data['full_name'],
            email=validated_data['email'],
        )
        email_username, _ = user.email.split("@")
        user.username = email_username
        user.set_password(validated_data['password'])
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'


# =========================================================================
# COURSE, TEACHER, ORDER, REVIEW, PAYMENTs, CART etc serialiser
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id','title', 'image', 'slug', 'course_count']
        model = Category
        
class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ['user', 'image', 'full_name', 'bio', 'facebook', 'twitter', 'linkedin', 'about', 'country', 'students', 'courses', 'reviews',]
        model = Teacher



class VariantItemSerializer(serializers.ModelSerializer):
    
    class Meta:
        fields = '__all__'
        model = VariantItem

    def __init__(self, *args, **kwargs):
        super(VariantItemSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3


class VariantSerializer(serializers.ModelSerializer):
    variant_items = VariantItemSerializer(many=True)
    items = VariantItemSerializer(many=True)
    class Meta:
        fields = '__all__'
        model = Variant
    def __init__(self, *args, **kwargs):
        super(VariantSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3





class CartSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = Cart

    def __init__(self, *args, **kwargs):
        super(CartSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3

class CartOrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = CartOrderItem

    def __init__(self, *args, **kwargs):
        super(CartOrderItemSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3


class CartOrderSerializer(serializers.ModelSerializer):
    order_items = CartOrderItemSerializer(many=True, read_only=True)
    class Meta:
        fields = '__all__'
        model = CartOrder

    def __init__(self, *args, **kwargs):
        super(CartOrderSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3



class Certificate(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = Certificate

class CompletedLessonsSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = CompletedLessons
    def __init__(self, *args, **kwargs):
        super(CompletedLessonsSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = Note

class ReviewSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(many=False)
    class Meta:
        fields = '__all__'
        model = Review
    
    def __init__(self, *args, **kwargs):
        super(ReviewSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = Notification

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = Coupon



class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = Country

class Question_Answer_MessageSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(many=False)
    class Meta:
        fields = '__all__'
        model = Question_Answer_Message

class Question_AnswerSerializer(serializers.ModelSerializer):
    messages = Question_Answer_MessageSerializer(many=True)
    profile = ProfileSerializer(many=False)

    class Meta:
        fields = '__all__'
        model = Question_Answer

class EnrolledCourseSerializer(serializers.ModelSerializer):
    lectures = VariantItemSerializer(many=True, read_only=True)
    completed_lessons = CompletedLessonsSerializer(many=True, read_only=True)
    curriculum = VariantSerializer(many=True, read_only=True)
    note = NoteSerializer(many=True, read_only=True)
    question_answer = Question_AnswerSerializer(many=True, read_only=True)
    review = ReviewSerializer(many=False, read_only=True)
    class Meta:
        fields = '__all__'
        model = EnrolledCourse
    
    def __init__(self, *args, **kwargs):
        super(EnrolledCourseSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3
        

class CourseSerializer(serializers.ModelSerializer):
    students = EnrolledCourseSerializer(many=True, required=False)
    curricullum = VariantSerializer(many=True, required=False)
    lectures = VariantItemSerializer(many=True, required=False)
    reviews = ReviewSerializer(many=True, required=False)
    class Meta:
        fields = [
            "category",
            "teacher",
            "file",
            "image",
            "title",
            "description",
            "price",
            "language",
            "level",
            "platform_course_status",
            "teacher_course_status",
            "featured",
            "course_id",
            "slug",
            "date",
            "students",
            "curricullum",
            "lectures",
            "average_rating",
            "rating_count",
            "reviews",
        ]

        model = Course

    def __init__(self, *args, **kwargs):
        super(CourseSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3   







class WishListSerializer(serializers.ModelSerializer):
    course = CourseSerializer()
    class Meta:
        fields = '__all__'
        model = WishList

    def __init__(self, *args, **kwargs):
        super(WishListSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.method == "POST":
            self.Meta.depth = 0
        else:
            self.Meta.depth = 3
# =======================================================================

# Student Stats Serializer

class StudentSummarySerializer(serializers.Serializer):
    total_courses = serializers.IntegerField(default=0)
    completed_lessons = serializers.IntegerField(default=0)
    certs = serializers.IntegerField(default=0)

# Teacher summary serializer

class TeacherSummarySerializer(serializers.Serializer):
    total_courses = serializers.IntegerField(default=0)
    total_students = serializers.IntegerField(default=0)
    monthly_revenue= serializers.IntegerField(default=0)
    total_revenue = serializers.IntegerField(default=0)

   





