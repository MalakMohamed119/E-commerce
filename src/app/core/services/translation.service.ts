import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

type TranslationKey = string;
type TranslationValue = string | { [key: string]: TranslationValue };
type TranslationObject = { [key: string]: TranslationValue };

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguage = new BehaviorSubject<string>('en');
  private translations: TranslationObject = {};
  private defaultLanguage = 'en';

  constructor(private http: HttpClient) {
    this.loadTranslations(this.defaultLanguage);
  }

  private loadTranslations(lang: string): void {
    this.http.get(`/assets/i18n/${lang}.json`).subscribe({
      next: (data) => {
        this.translations = data as TranslationObject;
        this.currentLanguage.next(lang);
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        localStorage.setItem('preferredLanguage', lang);
      },
      error: () => {
        console.error(`Failed to load translations for ${lang}`);
      }
    });
  }

  public setLanguage(lang: string): void {
    if (lang !== this.currentLanguage.value) {
      this.loadTranslations(lang);
    }
  }

  public getCurrentLanguage(): string {
    return this.currentLanguage.value;
  }

  public get(key: string, params: any = {}): string {
    const keys = key.split('.');
    let value: any = { ...this.translations };

    for (const k of keys) {
      if (value == null) return key;
      value = value[k];
    }

    if (typeof value !== 'string') return key;

    // Replace placeholders if any
    return value.replace(/\{\{\s*(\w+)\s*\}\}/g, (match: string, p1: string) => {
      return params[p1] || match;
    });
  }

  public getAsync(key: string, params: any = {}): Observable<string> {
    return of(this.get(key, params));
  }
}
