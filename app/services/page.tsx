import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ServiceRequestForm } from '@/components/ServiceRequestForm';
import { Icon } from '@/components/Icon';

export const metadata = { title: 'Услуги Bullmet', description: 'Лазерная резка, гибка металла, металлопрокат и изготовление изделий по чертежу или эскизу.' };

const services = [
  {
    id: 'laser',
    title: 'Лазерная резка',
    img: '/mockup/service-metal.jpg',
    text: 'Декор, таблички, вывески, панели, детали и элементы конструкций из листового металла.',
    points: ['точная геометрия', 'по чертежу или эскизу', 'подготовка к покраске']
  },
  {
    id: 'bending',
    title: 'Гибка металла',
    img: '/mockup/service-wood.jpg',
    text: 'Гибка листового металла для мебельных каркасов, навесов, деталей и малых архитектурных форм.',
    points: ['индивидуальные размеры', 'серийные и разовые задачи', 'согласование до запуска']
  },
  {
    id: 'metal',
    title: 'Мелкий опт металлопроката',
    img: '/mockup/cat-wood.jpg',
    text: 'Подбор и подготовка металла под задачу: для производства, мастерской, участка или ремонта.',
    points: ['подбор материала', 'расчет количества', 'подготовка под задачу']
  }
];

const process = [
  'Вы присылаете чертеж, фото или пример',
  'Мы уточняем размеры, материал и покрытие',
  'Считаем стоимость и сроки',
  'Изготавливаем и передаем заказ'
];

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main className="services-shop-page">
        <section className="services-hero-shop">
          <div className="container-page services-hero-grid">
            <div>
              <p className="page-kicker">Услуги производства</p>
              <h1>Резка, гибка и изготовление изделий под заказ</h1>
              <span>Работаем с металлом, элементами дерева и индивидуальными проектами. Рассчитаем стоимость по чертежу, фото или ссылке на пример.</span>
              <div className="services-hero-actions">
                <Link href="#request">Рассчитать стоимость</Link>
                <Link href="/catalog">Смотреть товары</Link>
              </div>
            </div>
            <div className="services-hero-photo">
              <Image src="/mockup/service-metal.jpg" alt="Лазерная резка Bullmet" width={920} height={620} priority />
            </div>
          </div>
        </section>

        <section className="container-page service-cards-shop" aria-label="Услуги Bullmet">
          {services.map((service) => (
            <article id={service.id} key={service.id}>
              <div className="service-card-image"><Image src={service.img} alt={service.title} width={640} height={430} /></div>
              <div className="service-card-body">
                <p><Icon name="spark" /> Производственная услуга</p>
                <h2>{service.title}</h2>
                <span>{service.text}</span>
                <ul>{service.points.map((point) => <li key={point}>{point}</li>)}</ul>
                <Link href="#request">Рассчитать</Link>
              </div>
            </article>
          ))}
        </section>

        <section className="container-page service-process-shop">
          <div className="service-process-head">
            <p className="page-kicker">Как проходит заказ</p>
            <h2>Понятный процесс без лишних шагов</h2>
          </div>
          <div className="service-process-grid">
            {process.map((item, index) => (
              <article key={item}>
                <b>0{index + 1}</b>
                <span>{item}</span>
              </article>
            ))}
          </div>
        </section>

        <section id="request" className="container-page service-request-section-shop">
          <div className="service-request-copy-shop">
            <p className="page-kicker">Расчет проекта</p>
            <h2>Отправьте чертеж, фото или ссылку на пример</h2>
            <span>Опишите задачу простыми словами. Мы свяжемся с вами, уточним детали и рассчитаем стоимость.</span>
            <div className="request-trust-row">
              <div><Icon name="shield" /><b>без обязательств</b></div>
              <div><Icon name="tools" /><b>подберем решение</b></div>
              <div><Icon name="truck" /><b>доставка по Беларуси</b></div>
            </div>
          </div>
          <ServiceRequestForm />
        </section>
      </main>
      <Footer />
    </>
  );
}
