# Generated by Django 4.2.7 on 2024-10-14 21:47

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_alter_completedlessons_options'),
    ]

    operations = [
        migrations.RenameField(
            model_name='cartorder',
            old_name='eamil',
            new_name='email',
        ),
        migrations.RenameField(
            model_name='cartorder',
            old_name='stripe_seesion_id',
            new_name='stripe_session_id',
        ),
    ]
