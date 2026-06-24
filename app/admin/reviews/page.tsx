export default function AdminReviews(){
  return (
    <div className="admin-dashboard-pro">
      <div className="admin-page-head">
        <div>
          <p>Отзывы</p>
          <h1>Отзывы покупателей</h1>
          <span>Отзывы публикуются сразу на карточке товара. Фото к отзывам сохраняются в Supabase Storage.</span>
        </div>
      </div>
      <section className="admin-panel-card">
        <p>Модерация отключена: новый отзыв получает статус published. При необходимости отзыв можно скрыть через таблицу product_reviews в Supabase, выставив status = hidden.</p>
      </section>
    </div>
  );
}
