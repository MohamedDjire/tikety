function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <p>© {currentYear} Tikety – Billetterie en ligne</p>
    </footer>
  )
}

export default Footer
