import { Link } from 'react-router-dom'
import { FAQ_ITEMS } from '../data/faq'
import './FAQ.css'

export default function FAQ() {
  return (
    <div className="faq">

      <div className="faq__header">
        <p className="faq__eyebrow">Support</p>
        <h1 className="faq__title">Frequently asked questions</h1>
        <p className="faq__subtitle">
          The questions most likely to come up before you commit. Where a policy genuinely
          isn't decided yet, we say so rather than inventing an answer.
        </p>
      </div>

      <div className="faq__list">
        {FAQ_ITEMS.map((item) => (
          <div key={item.id} className="faq__item">
            <h2 className="faq__question">{item.question}</h2>
            {item.answer && <p className="faq__answer">{item.answer}</p>}
            {item.todo && (
              <p className="faq__todo">
                <span className="faq__todo-badge">TODO: confirm policy</span>
                {item.todoNote && <span className="faq__todo-note"> — {item.todoNote}</span>}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="faq__cta">
        <p>Question not covered here?</p>
        <Link to="/contact" className="btn btn--primary">Contact us</Link>
      </div>

    </div>
  )
}
