
import { useState } from 'react';
import emailjs from '@emailjs/browser';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactFormState {
  isSubmitting: boolean;
  isSuccess: boolean;
  isError: boolean;
  errorMessage: string;
}

const initialState: ContactFormData = {
  name: '',
  email: '',
  subject: '',
  message: ''
};

// Récupérer les variables d'environnement de manière sécurisée
const getEnvVariable = (key: string): string => {
  // @ts-ignore - Vite expose les variables d'env sur import.meta.env
  return import.meta.env[key] || '';
};

const EMAILJS_SERVICE_ID = getEnvVariable('VITE_EMAILJS_SERVICE_ID');
const EMAILJS_TEMPLATE_ID = getEnvVariable('VITE_EMAILJS_TEMPLATE_ID');
const EMAILJS_PUBLIC_KEY = getEnvVariable('VITE_EMAILJS_PUBLIC_KEY');

export const useContactForm = () => {
  const [formData, setFormData] = useState<ContactFormData>(initialState);
  const [formState, setFormState] = useState<ContactFormState>({
    isSubmitting: false,
    isSuccess: false,
    isError: false,
    errorMessage: ''
  });

  const updateField = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formState.isSuccess || formState.isError) {
      setFormState({
        isSubmitting: false,
        isSuccess: false,
        isError: false,
        errorMessage: ''
      });
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setFormState({
        isSubmitting: false,
        isSuccess: false,
        isError: true,
        errorMessage: 'Please enter your name.'
      });
      return false;
    }

    if (!formData.email.trim()) {
      setFormState({
        isSubmitting: false,
        isSuccess: false,
        isError: true,
        errorMessage: 'Please enter your email address.'
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormState({
        isSubmitting: false,
        isSuccess: false,
        isError: true,
        errorMessage: 'Please enter a valid email address.'
      });
      return false;
    }

    if (!formData.subject.trim()) {
      setFormState({
        isSubmitting: false,
        isSuccess: false,
        isError: true,
        errorMessage: 'Please enter a subject.'
      });
      return false;
    }

    if (!formData.message.trim()) {
      setFormState({
        isSubmitting: false,
        isSuccess: false,
        isError: true,
        errorMessage: 'Please enter your message.'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setFormState({
      isSubmitting: true,
      isSuccess: false,
      isError: false,
      errorMessage: ''
    });

    if (!validateForm()) {
      return;
    }

    // Vérifier la configuration EmailJS
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      setFormState({
        isSubmitting: false,
        isSuccess: false,
        isError: true,
        errorMessage: 'EmailJS is not configured. Please add your credentials to the .env file.'
      });
      return;
    }

    try {
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        to_name: 'Strongify Team',
        reply_to: formData.email
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      setFormState({
        isSubmitting: false,
        isSuccess: true,
        isError: false,
        errorMessage: ''
      });

      setFormData(initialState);

      setTimeout(() => {
        setFormState(prev => ({
          ...prev,
          isSuccess: false
        }));
      }, 5000);

    } catch (error: any) {
      console.error('EmailJS Error:', error);

      let errorMessage = 'Failed to send message. Please try again later.';
      
      if (error?.status === 400) {
        errorMessage = 'Invalid request. Please check your EmailJS configuration.';
      } else if (error?.status === 401) {
        errorMessage = 'Authentication failed. Please check your EmailJS public key.';
      } else if (error?.status === 403) {
        errorMessage = 'Access denied. Please verify your EmailJS service configuration.';
      } else if (error?.text?.includes('service')) {
        errorMessage = 'Email service configuration error. Please check your Service ID.';
      } else if (error?.text?.includes('template')) {
        errorMessage = 'Email template configuration error. Please check your Template ID.';
      }

      setFormState({
        isSubmitting: false,
        isSuccess: false,
        isError: true,
        errorMessage
      });
    }
  };

  const resetForm = () => {
    setFormData(initialState);
    setFormState({
      isSubmitting: false,
      isSuccess: false,
      isError: false,
      errorMessage: ''
    });
  };

  return {
    formData,
    formState,
    updateField,
    handleSubmit,
    resetForm
  };
};
