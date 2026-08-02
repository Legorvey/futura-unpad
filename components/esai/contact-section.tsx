import React from 'react';
import { ContactSection as BaseContactSection, ContactPerson } from '@/components/ui/contact-section';

const contacts: ContactPerson[] = [
  {
    name: "Luvian",
    phone: "6285899983097",
    initial: "L"
  }
];

export function ContactSection() {
  return <BaseContactSection contacts={contacts} />;
}
