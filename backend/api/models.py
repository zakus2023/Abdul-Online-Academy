from typing import Any
from django.db import models
from userauths.models import User, Profile

from django.utils.text import slugify
from shortuuid.django_fields import ShortUUIDField
from django.utils import timezone
from moviepy.editor import VideoFileClip
import math

# Create your models here.

# Create all the choises here

NOTI_TYPE = (
     ("New Order", "New Order"),
     ("New Review", "New Review"),
     ("New Course Question", "New Course Question"),
     ("Draft", "Draft"),
     ("Course Published", "Course Published"),
     ("Course Enrollment Completed", "Course Enrollment Completed"),
     
)

RATING = (
     (1, "1 Star"),
     (2, "2 Star"),
     (3, "3 Star"),
     (4, "4 Star"),
     (5, "5 Star"),
     
)

PAYMENT_STATUS = (
     ("Paid", "Paid"),
     ("Processing", "Processing"),
     ("Failed", "Failed")
)

LANGUAGE =(
     ("English", "English"),
     ("French", "French"),
     ("Spanish", "Spanish"),
     ("Arabic", "Arabic"),
)

LEVEL = (
     ("Beginer", "Beginer"),
     ("Intermediate", "Intermediate"),
     ("Advanced", "Advanced"),

)

# TEACHER_STATUS = (
#      ("Review", "Review"),
#      ("Approved", "Approved"),
#      ("Disabled", "Disabled"),
# )

TEACHER_COURSE_STATUS = (
     ("Draft", "Draft"),
     ("Disabled", "Disabled"),
     ("Published", "Published"),
)

PLATFORM_COURSE_STATUS = (
     ("Review", "Review"),
     ("Disabled", "Disabled"),
     ("Rejected", "Rejected"),
     ("Approved", "Approved"),
)


class Teacher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    image = models.FileField(upload_to="course-file", blank=True, null=True, default="default.jpg")
    full_name = models.CharField(max_length=100)
    bio = models.CharField(max_length=100, null=True, blank=True)
    facebook = models.URLField(null=True, blank=True)
    twitter = models.URLField(null=True, blank=True)
    linkedin = models.URLField(null=True, blank=True)
    about = models.TextField(null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.full_name
    
    # Below are three member functions. students, courses and reviews. 
    # All the 3 will be automatic fields in the Teacher model. And teacher will be added in the Student, Course and Review models
    def students(self):
        return CartOrderItem.objects.filter(teacher=self)
    
    def courses(self):
        return Course.objects.filter(teacher=self)
    
    def review(self):
        return Review.Objects.filter(teacher=self).count() # here we need only the count
    
class Category(models.Model):
    title = models.CharField(max_length=100)
    image = models.FileField(upload_to="course-file", default="category,jpg", null=True, blank=True)
    active = models.BooleanField(default=True)
    slug = models.SlugField(unique=True, null=True, blank=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['title']

    def __str__(self):
            return self.title
        
    def course_count(self):
            return Course.objects.filter(category=self).count()
        
    def save(self, *args, **kwargs):
        if self.slug == "" or self.slug == None:
            self.slug = slugify(self.title)

            super(Category, self).save(*args, **kwargs)

class Course(models.Model):
     category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
     teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
     file = models.FileField(upload_to="course-file", blank=True, null=True)
     image = models.FileField(upload_to="course-file", blank=True, null=True)
     title = models.CharField(max_length=200)
     description = models.TextField(null=True, blank=True)
     price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
     language = models.CharField(choices=LANGUAGE, default="English", max_length=100)
     level = models.CharField(choices=LEVEL, default="Beginer", max_length=100)
     platform_course_status = models.CharField(choices=PLATFORM_COURSE_STATUS, default="Review", max_length=100)
     teacher_course_status = models.CharField(choices=TEACHER_COURSE_STATUS, default="Draft", max_length=100)
     featured = models.BooleanField(default=False)
     course_id = ShortUUIDField(unique=True, length=6, max_length=20, alphabet = "1234567890")
     slug = models.SlugField(unique=True, null=True, blank=True)
     date = models.DateTimeField(default=timezone.now)

     def __str__(self):
          return self.title
     
     def students(self):
          return EnrolledCourse.objects.filter(course=self)
     
     def curricullum(self):
          return Variant.objects.filter(course=self)
     
     def lectures(self):
        return VariantItem.objects.filter(variant__course=self)
     
     def average_rating(self):
          average_rating = Review.objects.filter(course=self).aggregate(avg_rating=models.Avg('rating'))
          return average_rating['avg_rating']
     
     def rating_count(self):
          return Review.objects.filter(course=self, active=True).count()
     
     def reviews(self):
          return Review.objects.filter(course=self, active=True)          

     def save(self, *args, **kwargs):
        if self.slug == "" or self.slug == None:
            self.slug = slugify(self.title) + str(self.course_id)

        super(Course, self).save(*args, **kwargs)

# these are the sections in the course
class Variant(models.Model):
     course = models.ForeignKey(Course, on_delete=models.CASCADE)
     title = models.CharField(max_length=1000)
     variant_id = ShortUUIDField(unique=True, length=6, max_length=20, alphabet = "1234567890")
     date = models.DateTimeField(default=timezone.now)

     def __str__(self):
          return self.title
     
     def variant_items(self):
          return VariantItem.objects.filter(variant=self)
     
     def items(self):
          return VariantItem.objects.filter(variant=self)
     
class VariantItem(models.Model):
    variant = models.ForeignKey(Variant, on_delete=models.CASCADE, related_name="variant_items")
    title = models.CharField(max_length=1000)
    description = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to="course-file", null=True, blank=True)
    duration = models.DurationField(null=True, blank=True) # Duration can be detected only when an mp4 file is detected not an mp3
    content_duration = models.CharField(max_length=1000, null=True, blank=True)
    preview = models.BooleanField(default=False)
    variant_item_id = ShortUUIDField(unique=True, length=6, max_length=20, alphabet = "1234567890")
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
         return f"{self.variant.title} - {self.title}"

    def save(self, *args, **kwargs):
         super().save(*args, **kwargs)

         if self.file:
              clip = VideoFileClip(self.file.path) # make sure you pip install moviepy==1.0.3
              duration_seconds = clip.duration

              minutes, remainder = divmod(duration_seconds, 60)
              minutes = math.floor(minutes)
              seconds = math.floor(remainder)

              duration_text = f"{minutes}m {seconds}s"
              self.content_duration = duration_text
              super().save(update_fields=['content_duration'])

class Question_Answer(models.Model):
     course = models.ForeignKey(Course,on_delete=models.CASCADE)
     user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
     title = models.CharField(max_length=1000, null=True, blank=True)
     qa_id = ShortUUIDField(unique=True, length=6, max_length=20, alphabet = "1234567890")
     date = models.DateTimeField(default=timezone.now)

     def __str__(self):
          return f"{self.user.username} - {self.course.title}"
     
     class Meta:
          ordering = ['-date']

     def messages(self):
          return Question_Answer_Message.objects.filter(question=self)
     
     def profile(self):
          return Profile.objects.get(user=self.user)

class Question_Answer_Message(models.Model):
     course = models.ForeignKey(Course,on_delete=models.CASCADE)
     question = models.ForeignKey(Question_Answer, on_delete=models.CASCADE)
     user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
     message = models.TextField(null=True, blank=True)
     qam_id = ShortUUIDField(unique=True, length=6, max_length=20, alphabet = "1234567890")
     date = models.DateTimeField(default=timezone.now)

     def __str__(self):
          return f"{self.user.username} - {self.course.title}"
     
     class Meta:
          ordering = ['date'] # oldest to newest

     def messages(self):
          return Question_Answer_Message.objects.filter(question=self)
     
     def profile(self):
          return Profile.objects.get(user=self.user)
     
class Cart(models.Model):
     course = models.ForeignKey(Course, on_delete=models.CASCADE)
     user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
     price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
     tax_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
     total = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
     country = models.CharField(max_length=100, null=True, blank=True)
     cart_id = ShortUUIDField(length=6, max_length=20, alphabet = "1234567890")
     date = models.DateTimeField(default=timezone.now)

     def __str__(self):
          return self.course.title
     
class CartOrder(models.Model):
     student = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
     teachers = models.ManyToManyField(Teacher, blank=True)
     sub_total = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
     tax_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
     saved = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
     total = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
     payment_status = models.CharField(choices=PAYMENT_STATUS, default="Processing", max_length=100)
     initial_total = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
     full_name = models.CharField(max_length=100, null=True, blank=True)
     email = models.CharField(max_length=100, null=True, blank=True)
     country = models.CharField(max_length=100, null=True, blank=True)
     coupons = models.ManyToManyField("api.Coupon", blank=True)
     stripe_session_id = models.CharField(max_length=1000, null=True, blank=True)
     order_id = ShortUUIDField(unique=True, length=6, max_length=20, alphabet = "1234567890")
     date = models.DateTimeField(default=timezone.now)

     class Meta:
          ordering = ['-date']

     def order_items(self):
          return CartOrderItem.objects.filter(order=self) 

     def __str__(self):
          return self.order_id
        
class CartOrderItem(models.Model):
     teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name="orderitem")
     course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="order_item")
     order = models.ForeignKey(CartOrder, on_delete=models.CASCADE,related_name="order_items")
     saved = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
     price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
     # sub_total = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
     tax_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
     total = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
     coupons = models.ManyToManyField("api.Coupon", blank=True)
     initial_total = models.DecimalField(max_digits=12, default=0.00, decimal_places=2)
     applied_coupon = models.BooleanField(default=False)
     cart_order_item_id = ShortUUIDField(unique=True, length=6, max_length=20, alphabet = "1234567890")
     date = models.DateTimeField(default=timezone.now)
     
     class Meta:
          ordering = ['-date']

     def order_id(self):
          return f"order ID #{self.order.order_id}"
     
     def payment_status(self):
          return f"{self.order.payment_status}"
     
     def __str__(self):
          return self.cart_order_item_id
     
class Certificate(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    certificate_id = ShortUUIDField(unique=True, length=6, max_length=20, alphabet = "1234567890")
    date = models.DateTimeField(default=timezone.now)


    def __str__(self):
          return self.course.title
    
class CompletedLessons(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    variant_item = models.ForeignKey(VariantItem, on_delete=models.CASCADE)
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
         return self.course.title
    
    class Meta:
        verbose_name_plural = "Completed Lessons"
    
class EnrolledCourse(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    enrollment_id = ShortUUIDField(unique=True, length=6, max_length=20, alphabet = "1234567890")
    date = models.DateTimeField(default=timezone.now)
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True)
    order_item = models.ForeignKey(CartOrderItem, on_delete=models.CASCADE)

    def __str__(self):
         return self.course.title
    
    def lectures(self):
         return VariantItem.objects.filter(variant__course=self.course)
    
    def completed_lessons(self):
         return CompletedLessons.objects.filter(course=self.course, user=self.user)
    
    def curriculum(self):
         return Variant.objects.filter(course=self.course)
    
    def note(self):
         return Note.objects.filter(course=self.course, user=self.user)
    
    def question_answer(self):
         return Question_Answer.objects.filter(course=self.course)
    
    def review(self):
         return Review.objects.filter(course=self.course, user=self.user).first()
    
class Note(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=1000, null=True, blank=True)
    note = models.TextField()
    note_id = ShortUUIDField(unique=True, length=6, max_length=20, alphabet = "1234567890")
    date = models.DateTimeField(default=timezone.now)
     
    def __str__(self):
         return self.title

class Review(models.Model):
     user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
     course = models.ForeignKey(Course, on_delete=models.CASCADE)
     date = models.DateTimeField(default=timezone.now)
     review = models.TextField()
     rating = models.IntegerField(choices=RATING, default=None)
     reply = models.CharField(null=True, blank=True, max_length=1000)
     active = models.BooleanField(default=False)

     def __str__(self) -> str:
          return self.course.title
     
     def profile(self):
          return Profile.objects.get(user=self.user)

class Notification(models.Model):
     user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
     teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, blank=True, null=True)
     order = models.ForeignKey(CartOrder, on_delete=models.SET_NULL, null=True, blank=True)
     order_item = models.ForeignKey(CartOrderItem, on_delete=models.SET_NULL, null=True, blank=True)
     review = models.ForeignKey(Review, on_delete=models.SET_NULL, blank=True, null=True)
     type = models.CharField(max_length=100, choices=NOTI_TYPE)
     seen = models.BooleanField(default=False)
     date = models.DateTimeField(default=timezone.now)

     def __str__(self):
          return self.type

class Coupon(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, blank=True, null=True)
    used_by = models.ManyToManyField(User, blank=True)
    code = models.CharField(max_length=50)
    discount = models.IntegerField(default=1)
    active = models.BooleanField(default=False)
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
          return self.code

class WishList(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)

    def __str__(self):
          return self.user.username
    
class Country(models.Model):
    name = models.CharField(max_length=100)
    tax_rate = models.IntegerField(default=5)
    active = models.BooleanField(default=True)

    def __str__(self):
          return self.name


