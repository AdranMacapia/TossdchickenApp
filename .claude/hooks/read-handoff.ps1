# Reads HANDOFF.md and injects it as additionalContext for the session start.
$handoffPath = "C:\Users\Adrian\Documents\TossdchickenApp\HANDOFF.md"
if (Test-Path $handoffPath) {
    $content = Get-Content $handoffPath -Raw
    $escaped = $content -replace '\\', '\\' -replace '"', '\"' -replace "`r`n", '\n' -replace "`n", '\n'
    $header = "=== TOSS D CHICKEN PROJECT HANDOFF ===\n\nRead this before doing anything. It has the current project status, last session work, and next steps.\n\n"
    Write-Output "{""hookSpecificOutput"":{""hookEventName"":""SessionStart"",""additionalContext"":""$header$escaped""}}"
}
