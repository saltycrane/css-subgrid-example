import Database from "better-sqlite3";
import { Fragment } from "react";

import styles from "./styles.module.css";

const db = new Database("db.sqlite3");

export default async function IndexPage() {
  const rows = db
    .prepare(
      `
      select
        id,
        oem_name,
        oem_code,
        json_group_array(obj) as items
      from (
        select
          ec.id,
          ec.oem_name,
          ec.oem_code,
          json_object(
            'oem_msrp', ec.oem_msrp,
            'oem_invoice', ec.oem_invoice,
            'style_equipment_status_id', ec.status_id,
            'model_name', m.name,
            'style_name', s.name
          ) as obj
        from
          equipment_configurations ec
        join
          styles s on ec.style_id = s.id
        join
          models m on s.model_id = m.id
        where
          ec.oem_code is not null and
          m.id = 56233
      ) tmp
      group by oem_name, oem_code
      limit 100;
      `,
    )
    .all();

  const firstRowItems = JSON.parse(rows[0].items).map(JSON.parse);

  return (
    <div className={styles.container}>
      <h4 className="fw-light">Equipment</h4>
      <div className={styles.grid}>
        <div className={styles.headerRows}>
          {/* 1st header row */}
          <div className={styles.topLeftHeaderCell} />
          <div />
          <div className={styles.vehicleNameHeaderCell}>
            {firstRowItems[0].model_name} {firstRowItems[0].style_name}
          </div>
          <div />
          <div className={styles.vehicleNameHeaderCell}>
            {firstRowItems[1]?.model_name} {firstRowItems[1]?.style_name}
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
        </div>
        {/* Data rows */}
        {rows.map((row: any) => {
          const items = JSON.parse(row.items).map(JSON.parse);
          return (
            <Fragment key={row.id}>
              <div className={styles.cell}>{row.oem_name}</div>
              <div className={styles.cell}>{row.oem_code}</div>
              <div />
              <div className={styles.cell}>
                {items[0].style_equipment_status_id}
              </div>
              <div className={styles.cell}>{items[0].oem_msrp}</div>
              <div className={styles.cell}>{items[0].oem_invoice}</div>
              <div />
              <div className={styles.cell}>
                {items[1]?.style_equipment_status_id}
              </div>
              <div className={styles.cell}>{items[1]?.oem_msrp}</div>
              <div className={styles.cell}>{items[1]?.oem_invoice}</div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
