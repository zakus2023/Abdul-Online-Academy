# Generated by Django 4.2.7 on 2024-11-11 00:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0017_alter_review_course'),
    ]

    operations = [
        migrations.AlterField(
            model_name='course',
            name='teacher_course_status',
            field=models.CharField(choices=[('Draft', 'Draft'), ('Disabled', 'Disabled'), ('Published', 'Published')], default='Draft', max_length=100),
        ),
    ]
