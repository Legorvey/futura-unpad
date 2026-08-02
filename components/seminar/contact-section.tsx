import React from 'react';
import { ContactSection as BaseContactSection, ContactPerson } from '@/components/ui/contact-section';

const contacts: ContactPerson[] = [
  {
    name: "Abid",
    phone: "62895609198200",
    initial: "A"
  }
];

export function ContactSection() {
  return <BaseContactSection contacts={contacts} />;
}
