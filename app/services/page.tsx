import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ServiceRequestForm } from '@/components/ServiceRequestForm';
import { Icon } from '@/components/Icon';

export const metadata = { title: 'Услуги Bullmet', description: 'Лазерная резка, гибка металла, изготовление изделий по чертежу или эскизу.' };

const services = [
  { id: 'laser', title: 'Лазерная резка', img: '/mockup/service-metal.jpg', text: 'Художественная резка из листового металла: декор, таблички, вывески, панели, детали и элементы конструкций.' },
  { id: 'bending', title: 'Гибка металла', img: '/mockup/service-wood.jpg', text: 'Гибка листового металла для мебельных каркасов, навесов, деталей, малых архитектурных форм и изделий под заказ.' },
  { id: 'metal', title: 'Мелкий опт металлопроката', img: '/mockup/cat-wood.jpg', text: 'Поможем подобрать металл под задачу, рассчитать количество и подготовить материал для дальнейшего производства.' }
];

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main className="service-page-polished">
        <section className="inner-page-hero inner-page-hero--services">
          <div className="container-page">
            <p>Главная › Услуги</p>
            <h1>Услуги производства Bullmet</h1>
            <span>Резка, гибка, подготовка металла и изготовление изделий по чертежу или эскизу.</span>
            <div>
              <Link href="#request">Заказать расчет</Link>
              <Link href="/catalog">Смотреть товары</Link>
            </div>
          </div>
        </section>

        <section className="container-page service-cards-polished">
          {services.map((service) => (
            <article id={service.id} key={service.id}>
              <Image src={service.img} alt={service.title} width={900} height={540} />
              <div>
                <span><Icon name="spark" /> Производственная услуга</span>
                <h2>{service.title}</h2>
                <p>{service.text}</p>
                <Link href="#request">Рассчитать стоимость</Link>
              </div>
            </article>
          ))}
        </section>

        <section className="container-page service-process-polished">
          {['Принимаем чертеж или эскиз', 'Уточняем материал и размеры', 'Считаем стоимость и сроки', 'Запускаем в производство'].map((item, index) => (
            <div key={item}><b>0{index + 1}</b><span>{item}</span></div>
          ))}
        </section>

        <section id="request" className="container-page service-request-section-polished">
          <div className="service-request-copy">
            <p>Расчет проекта</p>
            <h2>Отправьте чертеж, фото или ссылку на пример</h2>
            <span>Чем подробнее заявка, тем точнее мы сможем рассчитать стоимость и сроки. Можно прикрепить несколько файлов.</span>
            <ul>
              <li>Подходит для резки, гибки и изделий под заказ</li>
              <li>Можно отправить ссылку на пример товара</li>
              <li>Ответим и уточним детали перед запуском</li>
            </ul>
          </div>
          <ServiceRequestForm />
        </section>
      </main>
      <Footer />
    </>
  );
}
