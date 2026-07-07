// FAQ content. `answer: null` + `todo: true` means the policy is not yet decided —
// render the visible TODO placeholder rather than inventing an answer.

export const FAQ_ITEMS = [
  {
    id: 'damaged',
    question: 'What happens if a piece arrives damaged?',
    answer: null,
    todo: true,
  },
  {
    id: 'assembly',
    question: 'What does the assembly/installation add-on include, and what does it cost?',
    answer:
      'The add-on sends a local professional to your home to assemble and place your furniture so you don\'t have to. ' +
      'It\'s quoted separately from the furniture itself, based on your location and the size of the order.',
    todo: true,
    todoNote: 'Exact pricing structure for the assembly add-on is not finalized.',
  },
  {
    id: 'cancellation',
    question: 'Can I cancel or change my order mid-process, and what happens to my deposit?',
    answer: null,
    todo: true,
  },
  {
    id: 'payment-schedule',
    question: 'What\'s the payment schedule?',
    answer:
      'The general structure is a deposit at order confirmation to begin production, with the balance due before shipping.',
    todo: true,
    todoNote: 'Exact deposit percentage and balance timing are not finalized.',
  },
  {
    id: 'measurements',
    question: 'What if I don\'t know how to take accurate measurements?',
    answer:
      'You don\'t need to be precise on your own. The discovery and consult step exists specifically to help you ' +
      'translate "what I want" into accurate measurements — and the configurator lets you visualize dimensions ' +
      'in context before anything is finalized.',
    todo: false,
  },
  {
    id: 'materials',
    question: 'What materials and finishes are available?',
    answer:
      'Currently: solid oak, solid walnut, painted birch plywood, and painted MDF. Each has a different look, ' +
      'durability profile, and cost. The configurator lets you preview and price each option per piece.',
    todo: false,
  },
  {
    id: 'shipping-area',
    question: 'Do you ship to my area?',
    answer: null,
    todo: true,
  },
]
