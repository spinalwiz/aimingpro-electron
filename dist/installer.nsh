!macro customInstall
  # Add custom protocol to registry
  DetailPrint "Register Aiming.Pro URI Handler"
  DeleteRegKey HKCR "aimingpro"
  WriteRegStr HKCR "aimingpro" "" "URL:aimingpro"
  WriteRegStr HKCR "aimingpro" "URL Protocol" ""
  WriteRegStr HKCR "aimingpro\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  WriteRegStr HKCR "aimingpro\shell" "" ""
  WriteRegStr HKCR "aimingpro\shell\Open" "" ""
  WriteRegStr HKCR "aimingpro\shell\Open\command" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME} %1"
!macroend