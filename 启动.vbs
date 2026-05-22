Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get script directory
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

' Start backend silently (no window)
WshShell.Run """" & scriptDir & "\dudu_pos.exe""", 0, False

' Wait for server to be ready
WScript.Sleep 4000

' Open browser
WshShell.Run "http://localhost:8000"

' Keep script alive
Do While True
    WScript.Sleep 1000
Loop