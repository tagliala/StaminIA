#!/usr/bin/env python3
import json, os, sys

LANG_DIR = "lang"
APPENDS = {
    "es-es.json": '<p>Puedes estimar los subniveles de condición usando la función proporcionada en la pestaña <a href="#" id="extraLink"><i class="icon-plus-sign"></i> Extra</a></p>',
    "es-ca.json": '<p>Pots estimar els subnivells de condició usant la funció proporcionada a la pestanya <a href="#" id="extraLink"><i class="icon-plus-sign"></i> Extra</a></p>',
    "tr-tr.json": '<p>Kondisyon alt seviyelerini <a href="#" id="extraLink"><i class="icon-plus-sign"></i> Extra</a> sekmesindeki fonksiyonu kullanarak tahmin edebilirsiniz.</p>',
    "de-de.json": '<p>Du kannst die Konditions-Teilwerte mit der bereitgestellten Funktion im <a href="#" id="extraLink"><i class="icon-plus-sign"></i> Extra</a>-Tab schätzen.</p>',
    "fr-fr.json": "<p>Vous pouvez estimer les sous-niveaux de condition en utilisant la fonction fournie dans l'onglet <a href=\"#\" id=\"extraLink\"><i class=\"icon-plus-sign\"></i> Extra</a>.</p>",
    "nb-no.json": '<p>Du kan estimere kondisjonens undernivåer ved å bruke funksjonen under <a href="#" id="extraLink"><i class="icon-plus-sign"></i> Extra</a>-fanen.</p>',
    "nl-nl.json": '<p>U kunt de sublevels van conditie schatten met behulp van de functie in het tabblad <a href="#" id="extraLink"><i class="icon-plus-sign"></i> Extra</a>.</p>',
    "nl-be.json": '<p>U kunt de sublevels van conditie schatten met behulp van de functie in het tabblad <a href="#" id="extraLink"><i class="icon-plus-sign"></i> Extra</a>.</p>',
    "ru-ru.json": '<p>Вы можете оценить поднивели выносливости с помощью функции на вкладке <a href="#" id="extraLink"><i class="icon-plus-sign"></i> Extra</a>.</p>',
    "sv-se.json": '<p>Du kan uppskatta konditionens undernivåer med funktionen under fliken <a href="#" id="extraLink"><i class="icon-plus-sign"></i> Extra</a>.</p>',
    "el-gr.json": '<p>Μπορείτε να εκτιμήσετε τα υπο-επίπεδα αντοχής χρησιμοποιώντας τη λειτουργία στην καρτέλα <a href="#" id="extraLink"><i class="icon-plus-sign"></i> Extra</a>.</p>',
}

errors = 0
for fname, paragraph in APPENDS.items():
    path = os.path.join(LANG_DIR, fname)
    # Read raw to try parsing even if broken
    raw = open(path, encoding="utf-8").read()
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        # File is malformed from previous edit attempt — restore from git
        import subprocess
        result = subprocess.run(["git", "show", f"HEAD:{LANG_DIR}/{fname}"], capture_output=True, text=True)
        if result.returncode == 0:
            data = json.loads(result.stdout)
            print(f"Restored {fname} from git HEAD")
        else:
            print(f"ERROR: Cannot restore {fname}", file=sys.stderr)
            errors += 1
            continue

    lh = data.get("LONG_HELP", "")
    # Strip any partially-written extraLink paragraph leftover
    if 'id="extraLink"' in lh:
        # Already has it (possibly from a previous bad attempt) — rebuild cleanly
        # Find the start of the last <p> tag that contains extraLink
        idx = lh.rfind("<p>")
        if idx != -1 and 'extraLink' in lh[idx:]:
            lh = lh[:idx].rstrip()
        else:
            lh = lh

    # Append the correct paragraph
    data["LONG_HELP"] = lh + paragraph

    # Write back with proper JSON escaping
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"Fixed {fname}")

# Verify all files
print()
all_ok = True
for fname in sorted(os.listdir(LANG_DIR)):
    if not fname.endswith(".json"):
        continue
    path = os.path.join(LANG_DIR, fname)
    try:
        json.load(open(path, encoding="utf-8"))
    except Exception as e:
        print(f"INVALID JSON: {fname}: {e}", file=sys.stderr)
        all_ok = False
        errors += 1

if all_ok:
    print("All lang files are valid JSON.")
if errors:
    sys.exit(1)
