const LEGAL = {
  privacy: {
    title: 'Privacy Policy',
    body: 'Placeholder — to be authored before launch. This page must state, per app, exactly what data is collected, where it is stored, and for how long — written to match the shipped product, not a template.',
  },
  terms: {
    title: 'Terms of Service',
    body: 'Placeholder — to be authored before launch. Scope must cover the studio\u2019s sites and each published app, matching what each product actually does.',
  },
}

export default function Legal({ kind }) {
  const { title, body } = LEGAL[kind]
  return (
    <main className="legal" id="main">
      <h1>{title}</h1>
      <p>{body}</p>
    </main>
  )
}
