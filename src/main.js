import './style.css'

document.documentElement.classList.add('js')

const header = document.querySelector('[data-header]')
const toggle = document.querySelector('[data-nav-toggle]')
const mobileNav = document.querySelector('[data-mobile-nav]')
const form = document.querySelector('[data-form]')
const statusEl = document.querySelector('[data-form-status]')

function setHeaderState() {
  if (!header) return
  header.classList.toggle('is-scrolled', window.scrollY > 12)
}

setHeaderState()
window.addEventListener('scroll', setHeaderState, { passive: true })

if (toggle && mobileNav) {
  toggle.addEventListener('click', () => {
    const open = mobileNav.hasAttribute('hidden')
    if (open) {
      mobileNav.removeAttribute('hidden')
      toggle.setAttribute('aria-expanded', 'true')
      toggle.setAttribute('aria-label', 'Закрыть меню')
    } else {
      mobileNav.setAttribute('hidden', '')
      toggle.setAttribute('aria-expanded', 'false')
      toggle.setAttribute('aria-label', 'Открыть меню')
    }
  })

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileNav.setAttribute('hidden', '')
      toggle.setAttribute('aria-expanded', 'false')
      toggle.setAttribute('aria-label', 'Открыть меню')
    })
  })
}

document.querySelectorAll('[data-pin]').forEach((pin) => {
  pin.addEventListener('click', () => {
    const expanded = pin.getAttribute('aria-expanded') === 'true'
    const board = pin.closest('[data-board]')
    board?.querySelectorAll('[data-pin]').forEach((other) => {
      other.setAttribute('aria-expanded', 'false')
    })
    pin.setAttribute('aria-expanded', expanded ? 'false' : 'true')
  })
})

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (!reduceMotion && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in')
          io.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
  )

  document.querySelectorAll('.reveal').forEach((el) => io.observe(el))
} else {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-in'))
}

function buildMessage(data) {
  return [
    'Заявка с сайта Уютный дом',
    `Имя: ${data.name}`,
    `Телефон: ${data.phone}`,
    '',
    data.message,
  ].join('\n')
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return true
  }
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'absolute'
  area.style.left = '-9999px'
  document.body.appendChild(area)
  area.select()
  const ok = document.execCommand('copy')
  area.remove()
  return ok
}

if (form && statusEl) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    statusEl.classList.remove('is-ok', 'is-error')

    const data = Object.fromEntries(new FormData(form).entries())
    const name = String(data.name || '').trim()
    const phone = String(data.phone || '').trim()
    const message = String(data.message || '').trim()
    if (!name || !phone || !message) {
      statusEl.textContent = 'Заполните имя, телефон и описание работ.'
      statusEl.classList.add('is-error')
      return
    }

    const body = buildMessage({ name, phone, message })

    try {
      await copyText(body)
      statusEl.textContent = 'Текст заявки скопирован. Откроется диалог ВКонтакте — вставьте сообщение.'
      statusEl.classList.add('is-ok')
      window.open(
        'https://vk.com/im/convo/-236364510?entrypoint=community_page&tab=all',
        '_blank',
        'noopener,noreferrer',
      )
    } catch {
      statusEl.textContent = 'Не удалось скопировать. Напишите во ВКонтакте вручную или позвоните.'
      statusEl.classList.add('is-error')
    }
  })
}
