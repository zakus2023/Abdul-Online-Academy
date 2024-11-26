from api import views as api_views
from django.urls import path

from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [

    # Auth endpoints
    path('user/token/', api_views.MyTokenObtainPairView.as_view()),
    path('user/token/refresh/', TokenRefreshView.as_view()),
    path('user/register/', api_views.RegistrationView.as_view()),
    path('user/password-reset/<email>/', api_views.PasswordResetEmailVerifyAPIView.as_view()),
    path('user/change-password/', api_views.PasswordChangeAPIView.as_view()),  #For restting password
    path('user/password-change/', api_views.ChangePasswordAPIView.as_view()), #this is for changing password
    path('user/profile/<user_id>/', api_views.UserProfileAPIView.as_view()),

    # COURSE, TEACHER, ORDER, REVIEW, PAYMENTs, CART etc endpoints

    path('course/category/', api_views.CategoryListAPIView.as_view()),
    path('course/course-list/', api_views.CourseListAPIView.as_view()),
    path('course/course-detail/<slug>/', api_views.CourseDetailAPIView.as_view()),
    path('course/cart/', api_views.CartAPIView.as_view()),
    path('course/cart-list/<cart_id>/', api_views.CartListAPIView.as_view()),
    path('course/delete-cart-item/<cart_id>/<item_id>/', api_views.CartItemDeleteAPIView.as_view()),
    path('course/search/', api_views.SearchCourseAPIView.as_view()),
    path('cart/stats/<cart_id>/', api_views.CartStatsAPIView.as_view()),
    path('order/create-order/', api_views.CreateOrderAPIView.as_view()),
    path('order/checkout/<order_id>/', api_views.CheckoutAPIView.as_view()),
    path('order/coupon/', api_views.CouponApplyAPIView.as_view()),
    path('payment/stripe-checkout/<order_id>/', api_views.StripeCheckoutAPIView.as_view()),
    path('payment/payment-success/', api_views.PaymentSuccessAPIView.as_view()),

    # STUDENT ENDPOINT URLS

    path('student/summary/<user_id>/', api_views.StudentSummaryAPIView.as_view()),
    path('student/course-list/<user_id>/', api_views.StudentCourseListAPIView.as_view()),
    path('student/course-detail/<user_id>/<enrollment_id>/', api_views.StudentCourseDetailAPIView.as_view()),
    path('student/course-completed/', api_views.StudentCourseCompletedAPIView.as_view()),
    path('student/course-note/<user_id>/<enrollment_id>/', api_views.StudentNoteCreateAPIView.as_view()),
    path('student/course-note-detail/<user_id>/<enrollment_id>/<note_id>/', api_views.StudentNoteDetailAPIView.as_view()),
    path('student/review-course/', api_views.StudentCourseReviewCreateAPIView.as_view()),
    path('student/review-details/<user_id>/<review_id>/', api_views.StudentReviewCourseUpdateAPIView.as_view()),
    path('student/wishlist/<user_id>/', api_views.StudentWishListCreateListAPIView.as_view()),
    path('student/question-answer-list-create/<course_id>/', api_views.QuestionAndAnswerListCreateAPIView.as_view()),
    path('student/question-answer-message-send/', api_views.QuestionAnswerMessageSendAPIView.as_view()),

    # TEACHER ENDPOINTS
    path('teacher/summary/<teacher_id>/', api_views.TeacherSummaryAPIView.as_view()),
    path('teacher/course-list/<teacher_id>/', api_views.TeacherCourseListAPIView.as_view()),
    path('teacher/review-list/<teacher_id>/', api_views.TeacherReviewListAPIView.as_view()),
    path('teacher/review-detail/<teacher_id>/<review_id>/', api_views.TeacherReviewDetailAPIView.as_view()),
    path('teacher/student-list/<teacher_id>/', api_views.TeacherStudentListAPIView.as_view({'get': 'list'})),
    path('teacher/monthly-earnings/<teacher_id>/', api_views.TeacherMonthlyEarningAPIView),
    path('teacher/best-selling-course/<teacher_id>/', api_views.TeacherBestSellingCourseAPIView.as_view({'get':'list'})),
    path('teacher/course-orders/<teacher_id>/', api_views.TeacherCourseOrdersListAPIView.as_view()),
    path('teacher/question-answer/<teacher_id>/', api_views.TeacherQuestionAnswerAPIView.as_view()),
    path('teacher/list-coupons/<teacher_id>/', api_views.TeacherCouponListCreateAPIView.as_view()),
    path('teacher/coupon-detail/<teacher_id>/<coupon_id>/', api_views.TeacherCouponDetailAPIView.as_view()),
    path('teacher/list-notifications/<teacher_id>/', api_views.TeacherNotificationListAPIView.as_view()),
    path('teacher/notification-detail/<teacher_id>/<notification_id>/', api_views.TeacherNotificationDetailAPIView.as_view()),
    path('teacher/create-course/', api_views.CourseCreateAPIView.as_view()),
    path('teacher/update-course/<teacher_id>/<course_id>/', api_views.CourseUpdateAPIView.as_view()),
    path('teacher/course-detail/<course_id>/', api_views.TeacherCourseDetailAPIView.as_view()),
    path('teacher/course-variant-delete/<teacher_id>/<variant_id>/<course_id>/', api_views.CourseVariantDeleteAPIView.as_view()),
    # path('teacher/course-variant-item-delete/<teacher_id>/<variant_id>/<variant_item_id>/<course_id>/', api_views.CourseVariantItemDeleteAPIView.as_view()),
    path('teacher/course-variant-item-delete/<int:teacher_id>/<str:variant_id>/<str:variant_item_id>/<str:course_id>/', api_views.CourseVariantItemDeleteAPIView.as_view()),
    
]

