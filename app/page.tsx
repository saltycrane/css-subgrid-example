import postgres from "postgres";
import { Fragment } from "react";

import styles from "./styles.module.css";

const sql = postgres(
  "postgres://alg_pro_api:password@localhost:5432/alg_pro_api_dev",
);

export default async function IndexPage() {
  const rows = await sql`
    select
      oem_name,
      oem_code,
      json_agg(obj) as items
    from (
      select
        ec.oem_name,
        ec.oem_code,
        json_build_object(
          'oem_msrp', ec.oem_msrp,
          'oem_invoice', ec.oem_invoice,
          'style_equipment_status_id', ec.style_equipment_status_id,
          'model_name', m.name,
          'style_name', s.name
        ) as obj
      from
        vehicle.equipment_configurations ec
      join
        vehicle.styles s on ec.style_id = s.id
      join
        vehicle.models m on s.model_id = m.id
      where
        ec.oem_code is not null and
        m.id = 56233
    ) tmp
    group by oem_name, oem_code
    limit 100;
  `;

  return (
    <div className={styles.container}>
      <h4 className="fw-light">Equipment</h4>
      <div className={styles.grid}>
        {/* 1st header row */}
        <div className={styles.topLeftHeaderCell} />
        <div />
        <div className={styles.vehicleNameHeaderCell}>
          {rows[0].items[0].model_name} {rows[0].items[0].style_name}
        </div>
        <div />
        <div className={styles.vehicleNameHeaderCell}>
          {rows[0].items[1]?.model_name} {rows[0].items[1]?.style_name}
        </div>
        {/* 2nd header row */}
        <div className={styles.headerCell}>OEM Name</div>
        <div className={styles.headerCell}>OEM Code</div>
        <div />
        <div className={styles.headerCell}>Status</div>
        <div className={styles.headerCell}>MSRP</div>
        <div className={styles.headerCell}>Invoice</div>
        <div />
        <div className={styles.headerCell}>Status</div>
        <div className={styles.headerCell}>MSRP</div>
        <div className={styles.headerCell}>Invoice</div>
        {/* Data rows */}
        {rows.map((row) => {
          return (
            <Fragment key={row.id}>
              <div className={styles.cell}>{row.oem_name}</div>
              <div className={styles.cell}>{row.oem_code}</div>
              <div />
              <div className={styles.cell}>
                {row.items[0].style_equipment_status_id}
              </div>
              <div className={styles.cell}>{row.items[0].oem_msrp}</div>
              <div className={styles.cell}>{row.items[0].oem_invoice}</div>
              <div />
              <div className={styles.cell}>
                {row.items[1]?.style_equipment_status_id}
              </div>
              <div className={styles.cell}>{row.items[1]?.oem_msrp}</div>
              <div className={styles.cell}>{row.items[1]?.oem_invoice}</div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
