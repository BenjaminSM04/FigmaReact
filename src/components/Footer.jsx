export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner container">
        <span>© {new Date().getFullYear()} Sistemas · La Paz, Bolivia</span>
        <span>Demo frontend · los datos se guardan en este navegador</span>
      </div>
    </footer>
  );
}
