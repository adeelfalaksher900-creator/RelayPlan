"""Build allowlisted, inspectable source and submission archives without local credentials."""
from pathlib import Path
import hashlib, json, re, zipfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT.parent
ROOT_FILES = {"README.md", "LICENSE", "CONTRIBUTING.md", "DESIGN.md", ".gitignore", "package.json", "package-lock.json", "index.html", "vite.config.ts", "tsconfig.json", "components.json", "vercel.json", "remotion.config.ts", "llms.txt", "llms-full.txt"}
FOLDERS = {"src", "tests", "docs", "scripts", "video", "public"}
TEXT = {".md", ".json", ".txt", ".ts", ".tsx", ".css", ".html", ".cjs", ".py", ".svg", ".srt", ".vtt"}
MEDIA = {".png", ".jpg", ".mp3", ".wav"}
SECRET_PATTERNS = {
    "private-key": r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----",
    "github-token": r"(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})",
    "provider-key": r"(?:sk-(?:proj-)?[A-Za-z0-9_-]{35,}|AKIA[0-9A-Z]{16})",
    "credential-url": r"https?://[^\s/:]+:[^\s/@]+@",
    "jwt": r"eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}",
}
files = []
for p in ROOT.rglob("*"):
    if not p.is_file(): continue
    rel = p.relative_to(ROOT)
    if any(part in {"node_modules", "dist", ".git", ".vercel", ".hyperframes", "out"} for part in rel.parts): continue
    if p.name.startswith(".env") or p.name.endswith(".tsbuildinfo"): continue
    if (len(rel.parts) == 1 and p.name in ROOT_FILES) or (rel.parts[0] in FOLDERS and p.suffix in TEXT | MEDIA):
        files.append(p)
findings = []
for p in files:
    if p.suffix in TEXT or p.name == ".gitignore":
        text = p.read_text()
        for name, pattern in SECRET_PATTERNS.items():
            if re.search(pattern, text): findings.append({"path": str(p.relative_to(ROOT)), "pattern": name})
if findings: raise SystemExit(json.dumps({"status": "blocked", "findings": findings}))
manifest = [{"path":str(p.relative_to(ROOT)), "bytes":p.stat().st_size, "sha256":hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(files)]
report = {"status":"passed", "source_files":len(files), "secret_pattern_matches":0, "excluded":"Git history/config, dependency/build caches, environment files, provider account data, unrelated workspace files", "limits":"Pattern screening and an allowlisted archive do not prove absence of every possible secret. Demo data and exported examples are synthetic."}
for filename, include_video in [("RelayPlan-source.zip", False), ("RelayPlan-submission.zip", True)]:
    with zipfile.ZipFile(OUT/filename, "w", zipfile.ZIP_DEFLATED) as z:
        for p in files: z.write(p, Path("RelayPlan")/p.relative_to(ROOT))
        z.writestr("release-manifest.json", json.dumps(manifest, indent=2))
        z.writestr("release-check.json", json.dumps(report, indent=2))
        if include_video:
            z.write(OUT/"RelayPlan-final-1080p.mp4", "RelayPlan-walkthrough-1080p.mp4")
            z.write(ROOT/"video/RelayPlan-captions.srt", "RelayPlan-captions.srt")
            z.write(OUT/"RelayPlan-thumbnail-3x2.png", "RelayPlan-thumbnail-3x2.png")
            for p in sorted((OUT/"gallery").glob("*.*")): z.write(p, Path("gallery")/p.name)
    print(json.dumps({"file":filename, "bytes":(OUT/filename).stat().st_size, "checks":report}))
