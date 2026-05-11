Remove-Item -Recurse -Force vendas-de-sistema -ErrorAction SilentlyContinue
git add .
git commit -m "Adicionando PRD, RAG e novo Design"
git push -u origin main -f
