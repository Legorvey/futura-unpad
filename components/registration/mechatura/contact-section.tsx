import React from 'react';
import { ContactSection as BaseContactSection, ContactPerson } from '@/components/ui/contact-section';

const contacts: ContactPerson[] = [
  {
    name: "Adam",
    phone: "6289529846686",
    initial: "A"
  },
  {
    name: "Raisa",
    phone: "6285711735270",
    initial: "R"
  }
];

export function ContactSection() {
  return <BaseContactSection contacts={contacts} />;
}
