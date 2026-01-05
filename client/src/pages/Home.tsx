import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Zap, Shield, Headphones, ArrowRight, Gamepad2 } from 'lucide-react'
import Button from '../components/ui/Button'

export default function Home() {
  const { t } = useTranslation()

  const features = [
    { icon: Zap, key: 'feature1' },
    { icon: Shield, key: 'feature2' },
    { icon: Headphones, key: 'feature3' }
  ]

  return (
    <div>
      <section className="py-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/10 via-accent/5 to-transparent" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-accent/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-8">
            <Gamepad2 className="w-4 h-4" />
            <span>PUBG UC Store</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="gradient-text glow-text">{t('home.hero')}</span>
          </h1>
          <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto">{t('home.subtitle')}</p>
          <div className="flex justify-center">
            <Link to="/store">
              <Button size="lg" className="animate-pulse-glow group">
                {t('home.cta')}
                <ArrowRight className="w-5 h-5 ml-2 inline-block group-hover:translate-x-1 transition-transform rtl:rotate-180 rtl:mr-2 rtl:ml-0 rtl:group-hover:-translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 gradient-text">{t('home.features')}</h2>
          <p className="text-text-muted text-center mb-12 max-w-xl mx-auto">Everything you need for a seamless UC purchase experience</p>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, key }) => (
              <div key={key} className="glass rounded-2xl p-8 text-center group hover:glow-border hover:-translate-y-1 transition-all duration-300">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center group-hover:from-accent/30 group-hover:to-accent/10 transition-all">
                  <Icon className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{t(`home.${key}`)}</h3>
                <p className="text-text-muted">{t(`home.${key}Desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 gradient-text">{t('home.howItWorks')}</h2>
          <p className="text-text-muted text-center mb-12">Simple steps to get your UC codes</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['step1', 'step2', 'step3', 'step4'].map((step, i) => (
              <div key={step} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent to-accent/70 text-bg-primary flex items-center justify-center text-2xl font-bold group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-accent/30 transition-all duration-300">
                  {i + 1}
                </div>
                <p className="font-medium text-text-secondary group-hover:text-text-primary transition-colors">{t(`home.${step}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
