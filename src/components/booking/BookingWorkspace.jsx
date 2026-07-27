/**
 * BookingWorkspace — зөвхөн LAYOUT, логикгүй.
 *
 * Хоёр бүс:
 *   `top`   — БҮТЭН өргөн (салбар/үйлчилгээ/хаяг). Рэйлээр хумигдахгүй.
 *   `left`  — рэйлтэй хослох агуулга (зөвхөн эмчийн жагсаалт).
 *   `rail`  — баруун талын захиалгын хэсэг.
 *
 * Desktop (≥1024px) + `hasRail`: `left` ба `rail` хоёр багана болж, дээд мөрөөрөө
 * ЭГНЭНЭ (эмчийн жагсаалтын карт болон рэйл 1:1 таарна). `top` нь дээр нь бүтэн өргөнөөр.
 * Бусад тохиолдолд бүх зүйл нэг баганат урсгал.
 *
 * ⚠️ `rail` нь `hasRail=false` үед ч рендэрлэгдэнэ — дотроо BookingDetails-ыг агуулдаг
 * тул mount алдагдуулж болохгүй (mobile overlay + `step` state).
 * ⚠️ `lg:items-start` ЗААВАЛ: grid-ийн дефолт `stretch` нь рэйлийн `sticky`-г идэвхгүй болгоно.
 */
const CONTAINER = 'mx-auto w-full max-w-[1280px] lg:px-6';

export default function BookingWorkspace({ top, left, rail, hasRail = true }) {
    return (
        <>
            {top ? <div className={`${CONTAINER} lg:pt-4`}>{top}</div> : null}

            <div
                className={`${CONTAINER} lg:py-4 ${hasRail
                    ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-6 xl:grid-cols-[minmax(0,1fr)_420px]'
                    : ''
                    }`}
            >
                {left ? <div className="min-w-0">{left}</div> : null}
                {rail}
            </div>
        </>
    );
}
