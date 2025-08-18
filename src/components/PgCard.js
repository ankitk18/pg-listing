export default function PgCard({ pg }) {
  return (
    <div className="bg-[var(--dropdown)] text-[var(--text)] shadow-md rounded-2xl p-4 space-y-2 border border-[var(--border)]">
      {pg.images && pg.images.length > 0 && (
        <img
          src={pg.images[0] ? pg.images[0] : "/noImg.png"}
          alt={pg.name}
          className="w-full h-69 object-cover rounded-lg mb-2"
        />
      )}
      <h2 className="text-xl font-semibold text-[var(--primary)]">{pg.name}</h2>
      <p className="text-sm">
        <strong className="text-[var(--highlight)]">Near:</strong>{" "}
        {pg.nearByCollege}
      </p>
      <p className="text-sm">
        <strong className="text-[var(--highlight)]">Address:</strong>{" "}
        {pg.address}
      </p>
      <p className="text-[var(--hover)] font-semibold">₹{pg.rent}/month</p>
      <p className="text-sm opacity-70">{pg.description}</p>

      <div className="flex flex-wrap gap-2 mt-2">
        {pg.amenities.map((item, i) => (
          <span
            key={i}
            className="bg-[var(--primary)] text-[var(--bg)] px-2 py-1 text-xs rounded-full"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
