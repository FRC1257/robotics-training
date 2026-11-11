export function gradeAnswer(question, choice) {
  if (
    !Number.isInteger(choice) ||
    choice < 0 ||
    choice >= question.choices.length
  )
    throw new Error("Choose one answer.");
  return {
    correct: choice === question.answer,
    explanation: question.explanation,
    lesson: question.lesson,
  };
}
export function courseHref(source, base) {
  const output =
    source === "README.md"
      ? "index.html"
      : source.endsWith("/README.md")
        ? source.slice(0, -9) + "index.html"
        : source.replace(/\.md$/, ".html");
  return base + output.split("/").map(encodeURIComponent).join("/");
}
export async function mountKnowledgeCheck({ document, base, fetcher = fetch }) {
  const container = document.getElementById("quiz-body");
  if (!container) return;
  const status = document.getElementById("quiz-status");
  try {
    const response = await fetcher(base + "assets/knowledge-checks.json");
    if (!response.ok) throw Error();
    const { questions } = await response.json();
    let current = 0,
      score = 0,
      graded = false;
    function render() {
      container.replaceChildren();
      status.textContent = "";
      graded = false;
      if (current === questions.length) {
        const summary = document.createElement("p");
        summary.textContent = `You answered ${score} of ${questions.length} correctly on this pass. Review explanations and try a matching lab. This is practice, not hardware certification.`;
        const restart = document.createElement("button");
        restart.textContent = "Try again";
        restart.onclick = () => {
          current = 0;
          score = 0;
          render();
        };
        container.append(summary, restart);
        return;
      }
      const q = questions[current],
        counter = document.createElement("p"),
        form = document.createElement("form"),
        fieldset = document.createElement("fieldset"),
        legend = document.createElement("legend");
      counter.textContent = `Question ${current + 1} of ${questions.length}`;
      counter.className = "quiz-counter";
      legend.textContent = q.prompt;
      fieldset.append(legend);
      q.choices.forEach((text, i) => {
        const label = document.createElement("label"),
          input = document.createElement("input"),
          span = document.createElement("span");
        input.type = "radio";
        input.name = "answer";
        input.value = String(i);
        input.required = true;
        span.textContent = text;
        label.className = "quiz-choice";
        label.append(input, span);
        fieldset.append(label);
      });
      const check = document.createElement("button");
      check.type = "submit";
      check.textContent = "Check answer";
      const next = document.createElement("button");
      next.type = "button";
      next.textContent =
        current === questions.length - 1 ? "See result" : "Next question";
      next.hidden = true;
      next.onclick = () => {
        current++;
        render();
        container.querySelector("legend")?.scrollIntoView({ block: "nearest" });
        container.querySelector("input,button")?.focus();
      };
      form.append(fieldset, check, next);
      form.onsubmit = (event) => {
        event.preventDefault();
        if (graded) return;
        const selected = form.querySelector("input:checked");
        if (!selected) return;
        const result = gradeAnswer(q, Number(selected.value));
        graded = true;
        if (result.correct) score++;
        status.textContent =
          (result.correct ? "Correct. " : "Try reviewing this idea. ") +
          result.explanation;
        const link = document.createElement("a");
        link.href = courseHref(q.lesson, base);
        link.textContent = "Read the matching lesson";
        status.append(document.createTextNode(" "), link);
        for (const input of fieldset.querySelectorAll("input"))
          input.disabled = true;
        check.disabled = true;
        next.hidden = false;
        next.focus();
      };
      container.append(counter, form);
    }
    render();
  } catch {
    status.textContent =
      "Interactive questions could not load. The complete questions and answers below are still available.";
  }
}
