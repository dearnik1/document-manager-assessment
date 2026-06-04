from django.contrib import admin
from .models import Document, FileVersion

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('id', 'url_path', 'user')
    search_fields = ('url_path', 'user__email')

@admin.register(FileVersion)
class FileVersionAdmin(admin.ModelAdmin):
    list_display = ('id', 'document', 'version_number', 'file_name')
    list_filter = ('version_number',)
    search_fields = ('file_name', 'document__url_path')
