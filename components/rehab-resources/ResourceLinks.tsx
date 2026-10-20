export function ResourceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className="underline decoration-neutral-300 underline-offset-4 hover:text-teal-700 dark:hover:text-teal-300">{children}<span className="sr-only">（另開視窗）</span></a>
}

export function resourceTelephone(phone: string): string {
  return phone.split(/[、,，;/]|分機|轉|#|ext\.?/i)[0].replace(/[^\d+]/g, '')
}
