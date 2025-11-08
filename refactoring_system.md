# ✅ System Design & Architecture — ملخص عملي (بالعربي)

هنا تجميع شامل لكل اللي طلبته: **System Design**, **Architecture**, **Folder Structure**, **Data Flow**, **Algorithms** (pseudocode/خطوات)، **JSON Mapping Rules**، و**CLI Commands رسمية**. كل حاجة جاهزة للتطبيق — تقدر تنسخها وتبلّش تنفيذ أو توظيفها مباشرة.

---

# 1 — التصميم الكلي للنظام (High-level System Design)

**الهدف:** أداة CLI تحوّل مشروع React → Flutter آليًا (feature-first, clean-architecture), تعمل preview/diff ثم تطبّق وتدعم modes آمنة، وتسمح بدمج LLMs للتحسين الاختياري.

**مكوّنات النظام:**

* **CLI Orchestrator (Node/TS)**

  * إدارة الأوامر، تحميل الـplugins، تشغيل pipeline، progress tracker, UI CLI.
* **React Analyzer (Node/TS — ts-morph / Babel)**

  * يفكك ملفات React → يصدر IR (Intermediate Representation).
* **Generator (Node/TS + Templates)**

  * يحوّل IR → Dart skeletons باستخدام mapping rules وtemplates.
* **Dart Refactor Engine (Dart)**

  * يحسّن الكود الناتج بالـAST (`package:analyzer`)، يولّد SourceEdits ويُرجع unified diffs.
* **Asset Converter**

  * ينقل/يحَوّل الصور وSVGs، ويحدّث `pubspec.yaml`.
* **LLM Adapters (Optional)**

  * Claude / Gemini / Qwen — لتحسينات ذكية (بعد موافقة المستخدم).
* **Progress Tracker & Artifacts**

  * `output/.prprompts/` يحفظ progress.json, logs, diffs, golden images.
* **CI / Tests**

  * Unit, snapshot, integration, golden tests.

---

# 2 — Architecture (مفصّل)

```
[User CLI] -> [CLI Orchestrator (Node/TS)]
                     |
       +-------------+-------------+
       |             |             |
[React Analyzer] [Generator] [Asset Converter]
       |             |             |
       +-------> IR JSON <----------+
                     |
            [Dart Refactor Engine]
                     |
             unified diff / edits
                     |
         [Apply / Preview / Progress]
                     |
                Output Folder
```

**Contracts / Interfaces:**

* CLI ↔ React Analyzer: IR JSON files (per component/feature).
* CLI ↔ Generator: IR → generated Dart files (raw).
* CLI ↔ Dart Engine: stdin/stdout JSON (request/response).
* CLI ↔ LLM adapter: prompt → text/patch (must validate with analyzer).

---

# 3 — Folder Structure مقترح (قابل للتطبيق)

```
prprompts/
├─ bin/
│  └─ prprompts.js                # CLI entry
├─ src/
│  ├─ cli/
│  │   ├─ commands/
│  │   │   ├─ refactor.ts
│  │   │   ├─ analyze.ts
│  │   │   └─ progress.ts
│  │   └─ index.ts
│  ├─ react-analyzer/
│  │   ├─ extractor.ts            # ts-morph/Babel
│  │   └─ utils.ts
│  ├─ generator/
│  │   ├─ templates/              # Handlebars/EJS templates
│  │   ├─ generator.ts
│  │   └─ mapping/
│  ├─ adapters/
│  │   ├─ claude/
│  │   ├─ gemini/
│  │   └─ qwen/
│  ├─ pipeline/
│  │   └─ orchestrator.ts
│  └─ utils/
│       └─ file.ts
├─ tools/
│  └─ dart-refactor/
│      ├─ bin/refactor.dart
│      ├─ pubspec.yaml
│      └─ lib/
│          ├─ engine.dart
│          └─ strategies/
├─ mappings/
│  └─ ui-mapping.json
├─ prompts/
│  └─ ai_refactor_prompt.md
├─ examples/
├─ tests/
└─ package.json
```

---

# 4 — Data Flow (تفصيلي خطوة بخطوة)

1. **Start**: المستخدم يشغل:

   ```
   npx prprompts refactor react-to-flutter --input ./my-react-app --output ./my-react-app_flutter_clone --mode safe
   ```
2. **Orchestrator**:

   * يقوم بعمل scan للمشروع، يحدد features (routes, folders).
   * يسجل run في `output/.prprompts/runs/<ts>/meta.json`.
3. **React Analyzer**:

   * يقرأ ملفات `.jsx/.tsx/.js/.ts`، يبني AST بواسطة ts-morph.
   * يستخرج لكل component IR JSON (props, state, jsx tree, styles, hooks, imports).
   * يكتب IRs تحت `tmp/ir/<feature>/<component>.json`.
4. **Generator**:

   * يقرأ IR, يستخدم mapping rules + templates → يولّد raw Dart files في `tmp/generated/`.
   * يولّد أيضًا `feature manifest` يصف الملفات التي تم توليدها.
5. **Asset Converter**:

   * ينسخ ويحوّل الصور، يعالج SVGs (keeps for flutter_svg), يولّد entries للـ`pubspec.yaml`.
6. **Dart Refactor Engine**:

   * يستدعى عبر `dart` binary مع JSON payload (paths, options).
   * يقوم بتحليل الـDart الناتج، يصحّح imports، يحسّن الكود عبر AST, يولد unified diff + newContent.
7. **Preview**:

   * CLI يعرض unified diff للمستخدم، يحدث progress JSON، يسمح للمستخدم بالموافقة.
8. **Apply**:

   * إذا `--apply` أو user confirms: CLI يُطبّق edits (git apply أو write + format).
9. **Post-check**:

   * Runs `dart format`, `flutter pub get` (if needed), `flutter analyze`, `flutter test` (optional).
10. **Finish**:

* Final report in `output/.prprompts/report.json` + logs + optional golden images.

---

# 5 — Algorithms (pseudocode + خطوات عملية)

## A) Feature detection (heuristic)

```
for each file in src:
  if file contains <Route> or useHistory or BrowserRouter:
    mark file's directory as routeFeature
  else if file in components/header|footer|pages:
    group by folder as feature
```

## B) React AST → IR extraction (ts-morph)

```
for each componentFile:
  parseSource(file)
  findExportedComponents()
  for each component:
    props = extractProps(signature or PropTypes)
    hooks = findHooks( useState, useEffect, useContext, useReducer )
    jsxTree = traverseJSX(component.body)
    styles = collectClassNamesAndImports()
    metadata = inferFeatureFromPathOrRoute()
    writeIR(componentName, filePath, props, hooks, jsxTree, styles, metadata)
```

## C) JSX Node → Widget mapping (tree walker)

```
function mapJSXNode(node):
  switch node.type:
    case "JSXElement":
      widget = mapping.lookup(node.tagName)
      mappedProps = mapProps(node.props)
      children = node.children.map(mapJSXNode)
      return WidgetNode(widget, mappedProps, children)
    case "JSXText":
      return TextNode(node.value)
    case "JSXExpression":
      if expression is array.map -> ListView.builder skeleton
      else -> ExpressionNode(expression)
```

## D) Generator template rendering

```
for each Feature:
  for each WidgetNode:
    choose template by widget type and complexity
    fill placeholders:
      - constructor params from props
      - convert inline styles -> style constants
    output dart file path: lib/features/<feature>/presentation/widgets/<widget>.dart
```

## E) Dart AST polishing (Dart engine)

```
for each generatedDartFile:
  parse with analyzer -> CompilationUnit
  apply strategies:
    - add missing imports
    - replace var -> typed if inference present
    - extract repeated widgets to separate files
    - rename conflicts handled via SearchEngine rename
  format code with DartFormatter
  return newContent
```

## F) Progress tracking/update

```
totalFeatures = count(features)
for each feature processed:
  mark feature.status = done/in_progress/failed
  feature.percent = completedFiles / totalFiles
  write progress.json
  print CLI progress bar
```

---

# 6 — JSON Mapping Rules (مثال عملي قابل للتعديل)

`mappings/ui-mapping.json` (مختصر — أكتر قواعد ممكن تُضاف بسهولة):

```json
{
  "defaults": {
    "textMapping": {
      "h1": {"widget":"Text", "style":"headline1"},
      "h2": {"widget":"Text", "style":"headline2"},
      "p": {"widget":"Text", "style":"bodyText1"}
    },
    "container": {"widget":"Container"}
  },
  "elements": {
    "div": {
      "mapTo": ["Container","Row","Column"],
      "rules": [
        {"if":"style.display == 'flex' && style.flexDirection == 'row'", "use":"Row"},
        {"if":"style.display == 'flex' && style.flexDirection == 'column'", "use":"Column"},
        {"else":"Container"}
      ]
    },
    "img": {
      "mapTo": "Image",
      "attrs": {
        "src": {"to":"Image.assetOrNetwork", "strategy":"download_or_keep_network"}
      }
    },
    "button": {
      "mapTo": ["ElevatedButton","TextButton","OutlinedButton"],
      "chooseBy": "className|role"
    },
    "a": {
      "mapTo": "InkWell",
      "attrs": {"href":"Navigator.pushNamed"}
    },
    "ul|ol": {
      "mapTo": "ListView",
      "childrenMap": "li -> ListTile"
    },
    "input[type=text]": {
      "mapTo": "TextField",
      "props": {"placeholder":"decideHintText"}
    }
  },
  "styleRules": {
    "margin": "EdgeInsets",
    "padding": "EdgeInsets",
    "font-size": {"to":"fontSize", "scale":0.8},
    "box-shadow": {"to":"BoxDecoration.boxShadow", "approximate":true}
  },
  "stateMapping": {
    "useState": {"default":"Cubit", "thresholdForBloc":3},
    "useReducer": {"mapTo":"Bloc"},
    "context": {"mapTo":"Provider|GetIt"}
  },
  "routing": {
    "react-router": {"mapTo":"GoRouter", "routePattern":"path"}
  }
}
```

> هذه JSON rules قابلة للتوسيع؛ النظام يقرأها كـ config لتغيير السلوك بسرعة.

---

# 7 — CLI Commands الرسمية (syntax, flags، وصف مختصر)

## Global usage

```
prprompts <command> [options]
```

## 1) `refactor react-to-flutter` — التحويل الكامل أو الجزئي

```
prprompts refactor react-to-flutter \
  --input ./my-react-app \
  --output ./my-react-app_flutter_clone \
  --mode [safe|apply|merge|dry] \
  --state-management [bloc|cubit|provider|riverpod] \
  --ui-fidelity [low|medium|high] \
  --concurrency 4 \
  --features "auth,home,profile" \
  --allow-llm   # optional, must be explicit to call LLM
```

* **mode**: `safe` => show diffs only; `apply` => apply; `merge` => try 3-way merges; `dry` => run pipeline but don't write.
* **ui-fidelity**: `high` uses more advanced heuristics + optional LLM assistance.

## 2) `analyze` — تحليل المشروع وملف تقرير

```
prprompts analyze --input ./my-react-app --report ./report.json
```

* يقدّم breakdown للfeatures، تعقيدات، توقع وقت التحويل، اقتراح architecture profile.

## 3) `progress` — عرض حالة التنفيذ

```
prprompts progress --project ./my-react-app --output ./my-react-app_flutter_clone
```

* يعرض progress bar و feature list من `output/.prprompts/progress.json`.

## 4) `preview <feature>` — عرض diff مفصّل ل feature معين

```
prprompts preview --feature auth --output ./my-app_flutter_clone
```

## 5) `apply <feature>` — تطبيق تغييرات feature واحد

```
prprompts apply --feature auth --output ./my-app_flutter_clone --mode merge
```

## 6) `llm test` — اختبار موفري LLM المسجلين

```
prprompts llm test --provider claude
```

* يعرض health check و supported models.

## 7) `config` — إنشاء/تحرير prprompts.config.json

```
prprompts config set state-management=bloc
prprompts config get
```

## 8) `splash` — شاشة تعريفية / status

```
prprompts splash
```

## 9) `upgrade` — check & install updates

```
prprompts upgrade
```

---

# 8 — أمثلة ملفات config / run metadata

`prprompts.config.json`

```json
{
  "stateManagement": "bloc",
  "uiFidelity": "high",
  "concurrency": 3,
  "mappingFile": "./mappings/ui-mapping.json",
  "llm": {
    "enabled": false,
    "provider": "claude",
    "maxTokens": 1500
  }
}
```

`output/.prprompts/progress.json` (example)

```json
{
  "project":"my-react-app",
  "startedAt":"2025-11-05T20:00:00Z",
  "totalFeatures": 10,
  "completed": 3,
  "features": [
    {"name":"Header","status":"done","percent":100},
    {"name":"Auth","status":"in_progress","percent":45},
    {"name":"Dashboard","status":"pending","percent":0}
  ],
  "lastUpdate":"2025-11-05T20:23:00Z"
}
```

---

# 9 — مقترح تنفيذ سريع (Kickstart — 48 ساعة PoC)

**اليوم 1**

* Scaffold repo & CLI skeleton (`bin/prprompts.js`, commands/refactor.ts).
* Implement **React Analyzer PoC**: ts-morph script to extract a simple component IR.
* Create **mapping JSON** و basic Handlebars template for simple components.

**اليوم 2**

* Implement **Generator** to render template -> Dart file.
* Implement **Dart Refactor Engine skeleton** (bin/refactor.dart) that formats and returns unified diff.
* Implement CLI flow for single-component conversion: `prprompts refactor --input comp.jsx --output out/ --mode safe`.
* Demo: convert header component end-to-end and show preview diff.

---

# 10 — أخيراً — نصائح للوصول لأفضل نتيجة Production-grade

1. **ابدأ تدريجيًا**: feature-first, كل مرة feature وحدة تختبرها وتعدل قواعد mapping إن احتاج.
2. **اجعل القواعد قابلة للتعديل**: mapping JSON مهم جداً لتخصيص مشاريع مختلفة.
3. **اجعل الـAI مساعداً، ليس بديلاً**: always validate and run local analyzer before apply.
4. **أضف اختبار بصري**: Golden tests أو Playwright comparators.
5. **اجعل عمليات apply آمنة**: require git repo with clean working tree أو تنشئ branch تلقائياً.
6. **سجل كل شيء**: logs + audit trail لكل عملية تحويل.

------

# الملخص التنفيذي (what this plan delivers)

* نظام CLI `prprompts` يحوّل مشروع React إلى مشروع Flutter clone منظم (feature-first + clean-architecture).
* تحويل آمن: preview (diff) ثم apply، modes: `safe|apply|merge|dry`.
* AST-based analyzers: ts-morph (React) + package:analyzer (Dart).
* Asset pipeline، progress tracker، وCI شامل للاختبارات.
* إمكانيات AI-Assist قابلة للإضافة (Claude/Gemini/Qwen) بوضع اختياري وآمن.

---

# خارطة الطريق العامة (Roadmap — Milestones)

1. **Sprint 0 — Setup & PoC (2–4 أيام)** — Scaffold + PoC single-component conversion.
2. **Sprint 1 — Core Pipeline (1–2 أسابيع)** — React analyzer, IR, generator templates, Dart refactor skeleton, CLI basic commands.
3. **Sprint 2 — Feature Packaging & State Mapping (1–2 أسابيع)** — group features, state manager mapping (Bloc/Cubit), routing generator, asset pipeline.
4. **Sprint 3 — Robustness & Merge Modes (1 أسبوع)** — merge modes, git integration, backups, conflict handling.
5. **Sprint 4 — Tests, CI, Golden + Visual Regression (1 أسبوع)** — snapshot tests, integration tests, GitHub Actions.
6. **Sprint 5 — AI Assist + Plugins (1–2 أسابيع)** — LLM adapters, safe prompt pipeline, validation.
7. **Sprint 6 — Polish & Docs & Release (3–5 أيام)** — docs, examples, npm publish, VSCode extension scaffold (optional).

---

# تفصيل كل مرحلة: مهام، مخرجات، اختبارات، تعريف نجاح

## Sprint 0 — Setup & PoC (2–4 أيام)

**هدف:** إثبات إمكانية تحويل مكوّن React بسيط (مثلاً Header) إلى Flutter widget end-to-end.

**مهام:**

1. Scaffold repo: `bin/`, `src/`, `tools/dart-refactor/`, `mappings/`, `prompts/`, `examples/`.
2. Node CLI skeleton (`bin/prprompts.js`) يقرأ args ويشغّل أوامر.
3. Implement ts-morph PoC: `src/react-analyzer/extractor.ts` — read single component → output IR JSON.
4. Simple Handlebars/EJS template: map IR → Dart widget file.
5. Dart refactor skeleton: `tools/dart-refactor/bin/refactor.dart` — accept JSON via stdin, return unified diff.
6. Minimal generator flow: CLI runs analyzer → generator → calls Dart tool → prints diff (`--mode safe`).

**Deliverables:**

* `prprompts refactor --input examples/react/Header.jsx --output tmp/out --mode safe` converts and prints diff.
* IR JSON example and generated Dart file sample.

**اختبارات:**

* Manual test: run PoC on Header, inspect diff, ensure no syntax errors in generated Dart (run `dart format` & `dart analyze` on generated file).

**نجاح Sprint0:** PoC يعمل وCLI يعرض diff بدون أخطاء، and generated Dart compiles (or at least formats).

---

## Sprint 1 — Core Pipeline (1–2 أسابيع)

**هدف:** بناء pipeline مقروء ومستقر لكل مكوّن فردي ويخرج مشروع وسيط.

**مهام:**

1. **React Analyzer (production-ready)**

   * استخدم `ts-morph` لاستخراج: component type, props (TS/PropTypes), hooks, JSX tree, css class names, imports, routes usage.
   * Generate IR per component with metadata (feature hint, route, external APIs used).
2. **IR storage & schema**

   * تحديد JSON schema لـIR (اعتمد schema موحّدة).
   * اجعل كل IR تجي في `tmp/ir/<feature>/<component>.json`.
3. **Generator (templates)**

   * Handlebars/EJS templates لـ: Text, Container, Row/Column, Image, Button, List.
   * Implement mapping engine that reads `mappings/ui-mapping.json`.
4. **Asset Converter**

   * Copy public/assets → output/assets, detect svg/png/jpg, generate `pubspec.yaml` entries.
5. **Dart Refactor Engine** (improve)

   * implement basic strategies: add imports, format, unify names, produce `edits` with `newContent`.
6. **CLI orchestrator**

   * implement `refactor react-to-flutter` that processes one feature/component at a time, updates progress file.

**Deliverables:**

* Full pipeline capable of converting a small feature folder end-to-end to `output/<project>_flutter_clone`.
* Mapping rules file.
* Progress JSON updated per feature.

**اختبارات:**

* Snapshot tests: input component → expected Dart file.
* `dart format` & `dart analyze` success on generated project for sample features.

**نجاح Sprint1:** Pipeline converts >70% of simple components automatically; progress tracking works.

---

## Sprint 2 — Feature Packaging & State Mapping (1–2 أسابيع)

**هدف:** تجميع المكوّنات في features، وتحويل state/hooks → Bloc/Cubit/Provider، وتوليد routes وDI.

**مهام:**

1. **Feature detection heuristics**

   * Detect features by folder structure, react-router, route paths, filenames.
2. **State mapping**

   * map `useState` → `Cubit` (for local states small) or `Bloc` when multiple components share state.
   * map `useEffect` (fetch) → UseCase + Repository + Bloc event.
3. **Routing generator**

   * Generate `app_router.dart` using GoRouter or AutoRoute from react routes.
4. **DI skeleton**

   * Generate `injection_container.dart` with get_it registration for repos/usecases/blocs.
5. **Project structure generator**

   * Create `lib/features/<feature>/{presentation,domain,data}` with initial files.
6. **Tests scaffold**

   * Generate unit test templates for usecases and widget smoke tests.

**Deliverables:**

* `lib/` structure per feature.
* Example Bloc/Cubit generated for a form or auth flow.
* Routing & DI files.

**اختبارات:**

* Bloc unit tests for generated usecases (mocks).
* Widget build tests (should render without exceptions).

**نجاح Sprint2:** A non-trivial feature (e.g., Login flow) fully generated with Bloc, tests pass locally.

---

## Sprint 3 — Robustness: Merge Modes, Git Integration, Backups (1 أسبوع)

**هدف:** Make `apply` safe for real repos, add merge/conflict handling, backups.

**مهام:**

1. **Git pre-checks**

   * Ensure working tree clean before apply (or auto-create branch). If not clean, warn/stop.
2. **Apply strategies**

   * Implement `--mode=merge` that generates patch (unified diff) and tries `git apply --3way`.
   * On conflicts show detailed conflict markers and allow interactive resolution CLI.
3. **Backups & audit**

   * On apply, create backup copy or use git branch/commit. Save run artifacts in `output/.prprompts/runs/<ts>/`.
4. **Conflict UI**

   * Implement `prprompts conflicts --run <ts>` to inspect conflicts easily.

**Deliverables:**

* Safe apply with `git` based patch application.
* Branch creation and artifact logging.

**اختبارات:**

* Simulate conflicting repo scenario and assert conflict detection & resolution flow functions.

**نجاح Sprint3:** Apply works safely, conflict cases handled, no data loss in tests.

---

## Sprint 4 — Testing, CI, Visual Regression (1 أسبوع)

**هدف:** Add automated tests across the pipeline and CI.

**مهام:**

1. **Unit tests (Node)** for analyzer + generator + mapping rules.
2. **Dart tests** for refactor engine strategies.
3. **Snapshot tests** for generated code (fixtures -> expected).
4. **Integration smoke tests**: run pipeline on sample repo, run `flutter analyze` and `flutter test`.
5. **Visual regression**

   * Capture React screenshots for key pages using Playwright.
   * Generate Flutter golden images and compare (pixel or perceptual diff).
   * If mismatch above threshold flag for manual review.
6. **CI config (GitHub Actions)**

   * `ci.yml`: lint, node tests, dart tests, pipeline smoke test.
   * `publish.yml`: on tag, publish npm package.

**CI snippet (example)**:

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: node-version: 20
      - run: npm ci
      - run: npm test
      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: 'stable'
      - run: |
          cd tools/dart-refactor
          dart pub get
          dart test
      - name: Smoke test pipeline
        run: npm run smoke-test
```

**Deliverables:**

* CI running tests for PRs.
* Visual regression harness for key screens.

**نجاح Sprint4:** PRs blocked until tests pass; generated projects pass analyzer in CI.

---

## Sprint 5 — AI Assist & Plugins (1–2 أسابيع)

**هدف:** Add LLM adapters and safe AI-enhanced refactor suggestions.

**مهام:**

1. **LLM Adapter interface** (TS) — common methods: `models()`, `complete(prompt)`, `healthCheck()`.
2. **Adapters implementation** for Claude/Gemini/Qwen (mock first). Keep prompts in `prompts/` folder with versioning.
3. **AI workflow**

   * Local validation: LLM outputs must be patch/unified-diff only.
   * Validate parsing, run `dart analyze` on temp apply; if errors reject.
4. **Consent & privacy**

   * require `--allow-llm`. Mask secrets before sending.
   * Log calls (prompt hash) but not content.
5. **LLM unit tests** with mock providers.

**Deliverables:**

* `prprompts refactor --allow-llm` option.
* LLM adapters initial version.

**اختبارات:**

* Mock tests to ensure that AI suggestions validated and not applied if invalid.

**نجاح Sprint5:** AI suggestions available, safe validation prevents broken code application.

---

## Sprint 6 — Polish, Docs, Publish (3–5 أيام)

**هدف:** Complete docs, examples, templates, publish to npm, prepare release.

**مهام:**

1. **Docs**: README, CONTRIBUTING, REFRACTOR.md, mapping rules docs, prompt docs.
2. **Examples repo**: small React sample projects & expected Flutter outputs.
3. **Publishing**: bump package.json, create CHANGELOG, publish to npm.
4. **Release notes**: instructions for extensions (Claude/Gemini integration).
5. **Optional**: basic VSCode extension scaffolding (calls CLI).

**Deliverables:**

* npm package `prprompts` published (or your scoped package).
* Documentation site or README with tutorials.
* Example conversions.

**نجاح Sprint6:** Public release with working examples and docs.

---

# موارد، أدوار فريق، وأدوات مقترحة

**Roles**

* Lead Dev (Node/TS) — CLI, generator, mapping rules — 60% effort.
* Dart Engineer — Dart refactor engine, analyzer logic — 40% effort.
* QA/CI — tests, GH Actions, smoke tests — part-time.
* Optional: UI/UX reviewer for mapping rules and golden tests.

**Tools**

* Node 20+, TypeScript, ts-morph, Handlebars/EJS, child_process/execa
* Dart SDK, package:analyzer, dart_style, flutter for generated project validation
* GitHub Actions, Playwright (screenshots), Jest (Node tests), dart test
* Optional: Dependabot, Snyk, git-secrets, husky

---

# مقاييس نجاح (KPIs)

* **MVP success**: Convert 70% of components in sample apps automatically with no manual edits required.
* **Quality**: Generated project passes `flutter analyze` and majority of generated widget smoke tests (>80%).
* **Safety**: No applied transformations on unclean working directory without explicit branch creation.
* **Performance**: Time per feature average < X seconds (configurable), concurrency used.
* **Adoption**: internal users can convert a small app end-to-end in < 30 minutes (includes review).

---

# سياسة الأمان والخصوصية (must-haves)

* Require `--allow-llm` for any LLM usage.
* Sanitize code before sending (strip secrets).
* Audit logs per run: timestamp, provider, promptHash (no raw prompts).
* Pre-apply backup (git branch or .bak files).
* Rate limit LLM calls and maintain opt-in telemetry.

---

# PR / Release checklists (Templates)

**PR checklist**

* [ ] All unit tests pass
* [ ] Snapshot tests updated or unchanged
* [ ] Dart `format` and `analyze` pass for generated samples
* [ ] No secrets in diffs (`git-secrets`)
* [ ] Docs/CHANGELOG updated if necessary
* [ ] CI passes

**Release checklist**

* [ ] Bump version (semver)
* [ ] Run full integration pipeline on example(s)
* [ ] Publish npm package (or tag for CI)
* [ ] Publish release notes

---

# Error handling & rollback plan

* On apply failure: automatically create `branch/prprompts/refactor/<timestamp>` with current changes, leave workspace untouched.
* Save artifacts: `output/.prprompts/runs/<timestamp>/` includes backups, diffs, logs.
* Provide `prprompts rollback --run <timestamp>` to revert (via git branch checkout or restore .bak files).

---

# مثال أوامر عملية (quick reference)

* Preview single component:

  ```
  npx prprompts refactor react-to-flutter --input src/components/Header.jsx --output ./out --mode safe
  ```
* Convert whole project (dry run):

  ```
  npx prprompts refactor react-to-flutter --input ./my-react-app --output ./my-react-app_flutter_clone --mode dry --concurrency 4 --state-management bloc
  ```
* Apply feature:

  ```
  npx prprompts apply --feature auth --output ./my-app_flutter_clone --mode merge
  ```
* Use AI suggestions (consent required):

  ```
  npx prprompts refactor react-to-flutter --input ./my-react-app --output ./out --allow-llm --ui-fidelity high
  ```

---

# المخاطر الرئيسية وطرق التخفيف (Risks & Mitigations)

1. **Mismatch in UI expectations** — Mitigation: Visual regression + manual review.
2. **Broken applied code** — Mitigation: analyzer validation + git branch backup + safe mode.
3. **LLM hallucinations** — Mitigation: optional LLM with validation, never apply blindly.
4. **Performance on large projects** — Mitigation: concurrency config + caching + per-feature processing.
5. **Secrets leakage to LLM** — Mitigation: scrub inputs, opt-in only.

---

