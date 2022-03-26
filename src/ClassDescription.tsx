import { Class, Flags } from "./class";
import { Firehose } from "./firehose";

/** A small image indicating a flag, like Spring or CI-H. */
function TypeSpan(props: { flag: string; title: string }) {
  const { flag, title } = props;
  return (
    <span className="type-span" id={`${flag}-span`}>
      <img
        alt={title}
        height="16"
        width="16"
        src={`img/${flag}.gif`}
        data-toggle="tooltip"
        data-placement="top"
        title={title}
        data-trigger="hover"
      />
    </span>
  );
}

/** Header for class description; contains flags and related classes. */
function ClassTypes(props: { cls: Class }) {
  const { cls } = props;
  const { flags, totalUnits, units } = cls;

  /**
   * Wrap a group of flags in TypeSpans.
   *
   * @param arr - Arrays with [flag name, alt text].
   */
  const makeFlags = (arr: Array<[keyof Flags, string]>) =>
    arr
      .filter(([flag, _]) => flags[flag])
      .map(([flag, title]) => (
        <TypeSpan key={flag} flag={flag} title={title} />
      ));

  const types1 = makeFlags([
    ["nonext", "Not offered 2021-2022"],
    ["under", "Undergrad"],
    ["grad", "Graduate"],
  ]);

  const seasons = makeFlags([
    ["fall", "Fall"],
    ["iap", "IAP"],
    ["spring", "Spring"],
    ["summer", "Summer"],
  ])
    .map((tag) => [tag, ", "])
    .flat()
    .slice(0, -1);

  const types2 = makeFlags([
    ["repeat", "Can be repeated for credit"],
    ["rest", "REST"],
    ["Lab", "Institute Lab"],
    ["PartLab", "Partial Institute Lab"],
    ["hassH", "HASS-H"],
    ["hassA", "HASS-A"],
    ["hassS", "HASS-S"],
    ["hassE", "HASS-E"],
    ["cih", "CI-H"],
    ["cihw", "CI-HW"],
  ]);

  return (
    <p id="class-type">
      {types1} ({seasons}) {types2} {totalUnits} units: {units.join("-")}
      {flags.final ? (
        <span className="type-span" id="final-span">
          {" "}
          Has final
        </span>
      ) : null}
      <br />
    </p>
  );
}

/** List of related classes, appears after flags and before description. */
function ClassRelated(props: { cls: Class; firehose: Firehose }) {
  const { cls, firehose } = props;
  const { prereq, same, meets } = cls.related;

  /** Wrapper to link all classes in a given string. */
  const linkClasses = (str: string) =>
    str.split(/([ ,;[\]()])/).map((text) => {
      const cls = firehose.classes.get(text);
      if (!cls) return text;
      return (
        <span key={text} onClick={() => firehose.classDescription(cls)}>
          {text}
        </span>
      );
    });

  return (
    <>
      <span id="class-prereq">Prereq: {linkClasses(prereq)}</span>
      {same ? (
        <span id="class-same">
          <br />
          Same class as: {linkClasses(same)}
        </span>
      ) : null}
      {meets ? (
        <span id="class-meets">
          <br />
          Meets with: {linkClasses(meets)}
        </span>
      ) : null}
    </>
  );
}

/** Class evaluation info. */
function ClassEval(props: { cls: Class }) {
  const { cls } = props;
  const { rating, hours, people } = cls.evals;

  return (
    <p id="class-eval">
      Rating: {rating}&nbsp;&nbsp;&nbsp; Hours: {hours}&nbsp;&nbsp;&nbsp; Avg #
      of students: {people}
    </p>
  );
}

/** Class description, person in-charge, and any URLs afterward. */
function ClassBody(props: { cls: Class }) {
  const { cls } = props;
  const { description, inCharge, extraUrls } = cls.description;

  return (
    <p id="class-desc">
      {description}
      <br />
      <br />
      {inCharge ? (
        <>
          <em>In-charge: {inCharge}</em>
          <br />
          <br />
        </>
      ) : null}
      {extraUrls
        .map<React.ReactNode>(({ label, url }) => (
          <a key={label} href={url}>
            {label}
          </a>
        ))
        .reduce((acc, cur) => [acc, " | ", cur])}
    </p>
  );
}

function ClassButtons(props: { cls: Class; firehose: Firehose }) {
  const { cls, firehose } = props;

  // TODO: these buttons don't work because currentClasses aren't state!
  if (!firehose.isCurrentClass(cls)) {
    return (
      <div id="class-buttons-div">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => firehose.addClass(cls)}
        >
          Add class
        </button>
      </div>
    );
  } else {
    return (
      <div id="class-buttons-div">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => firehose.removeClass(cls)}
        >
          Remove class
        </button>
        <p id="manual-button">+ Manually set sections</p>
        <div id="manual-div" style={{ display: "none" }}>
          <div id="man-lec-div">
            Lecture:
            <br />
            <input
              type="radio"
              className="man-button"
              id="lec-auto"
              name="lec"
              value="auto"
            />{" "}
            Auto (default)
            <br />
            <input
              type="radio"
              className="man-button"
              id="lec-none"
              name="lec"
              value="none"
            />{" "}
            None
            <br />
            <div id="spec-man-lec-div"></div>
          </div>
          <div id="man-rec-div">
            Recitation:
            <br />
            <input
              type="radio"
              className="man-button"
              id="rec-auto"
              name="rec"
              value="auto"
            />{" "}
            Auto (default)
            <br />
            <input
              type="radio"
              className="man-button"
              id="rec-none"
              name="rec"
              value="none"
            />{" "}
            None
            <br />
            <div id="spec-man-rec-div"></div>
          </div>
          <div id="man-lab-div">
            Lab:
            <br />
            <input
              type="radio"
              className="man-button"
              id="lab-auto"
              name="lab"
              value="auto"
            />{" "}
            Auto (default)
            <br />
            <input
              type="radio"
              className="man-button"
              id="lab-none"
              name="lab"
              value="none"
            />{" "}
            None
            <br />
            <div id="spec-man-lab-div"></div>
          </div>
        </div>
      </div>
    );
  }
}

/**
 * Full class description, from title to URLs at the end.
 * TODO: make the class buttons work nicely.
 */
export function ClassDescription(props: { cls: Class; firehose: Firehose }) {
  const { cls, firehose } = props;

  return (
    <>
      <p id="class-name">
        {cls.number}: {cls.name}
      </p>
      <div id="flags-div">
        <ClassTypes cls={cls} />
        <ClassRelated cls={cls} firehose={firehose} />
        <ClassEval cls={cls} />
      </div>
      <ClassButtons cls={cls} firehose={firehose} />
      <ClassBody cls={cls} />
    </>
  );
}
