{{/*
Generate or retrieve the sync auth token
This helper checks if a secret already exists and reuses the token,
otherwise generates a new one. This ensures the token persists across upgrades.
*/}}
{{- define "nextjs-sqlite.syncAuthToken" -}}
{{- $secretName := printf "%s-secrets" (include "nextjs-sqlite.fullname" .) -}}
{{- $existingSecret := lookup "v1" "Secret" .Release.Namespace $secretName -}}
{{- if $existingSecret -}}
  {{- index $existingSecret.data "sync-auth-token" -}}
{{- else if .Values.secrets.syncAuthToken -}}
  {{- .Values.secrets.syncAuthToken | b64enc -}}
{{- else -}}
  {{- randAlphaNum 32 | b64enc -}}
{{- end -}}
{{- end -}}