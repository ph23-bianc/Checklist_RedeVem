export interface ChecklistItem {
  id: string;
  text: string;
}

export interface ChecklistSection {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export const CHECKLIST_SECTIONS: ChecklistSection[] = [
  {
    id: "aparencia_externa",
    title: "APARÊNCIA EXTERNA",
    items: [
      { id: "ae_01", text: "Fachadas frontal e lateral estão limpas e conservadas?" },
      { id: "ae_02", text: "Calçadas frontal e lateral estão limpas?" },
      { id: "ae_03", text: "Lixeiras externas estão limpas?" },
      { id: "ae_04", text: "Vidraças e paredes estão limpas?" },
      { id: "ae_05", text: "As paredes estão bem pintadas?" },
      { id: "ae_06", text: "Existem cartazes de ofertas?" },
      { id: "ae_07", text: "Os cartazes estão no padrão? (Fixação, alinhamento)" },
      { id: "ae_08", text: "A iluminação está satisfatória?" },
    ],
  },
  {
    id: "gondolas",
    title: "GÔNDOLAS",
    items: [
      { id: "go_01", text: "As gôndolas estão limpas e com pintura conservada?" },
      { id: "go_02", text: "As gôndolas estão bem abastecidas?" },
      { id: "go_03", text: "Todos os produtos têm preço identificado?" },
      { id: "go_04", text: "Os produtos estão bem arrumados e com número adequado de frentes?" },
      { id: "go_05", text: "As pontas de gôndolas estão com promoções, abastecidas, e identificadas com cartazes?" },
      { id: "go_06", text: "As embalagens estão limpas e novas?" },
      { id: "go_07", text: "Os corredores estão sem caixas e carrinhos de reposição?" },
      { id: "go_08", text: "Existem fitas cross distribuídas em todas as gôndolas?" },
      { id: "go_09", text: "As Fitas estão abastecidas?" },
      { id: "go_10", text: "Há cartazes de oferta?" },
      { id: "go_11", text: "Organização FIFO" },
      { id: "go_12", text: "Produtos vencidos fora da área de venda e devidamente organizados e sinalizados?" },
      { id: "go_13", text: "A iluminação está satisfatória nos corredores?" },
    ],
  },
  {
    id: "ilha_congelado",
    title: "ILHA DE CONGELADO / GELADEIRAS",
    items: [
      { id: "ic_01", text: "Todos os produtos estão com preços?" },
      { id: "ic_02", text: "Os produtos estão bem arrumados e limpos?" },
      { id: "ic_03", text: "As prateleiras estão bem abastecidas?" },
      { id: "ic_04", text: "A temperatura está correta?" },
      { id: "ic_05", text: "Há oferta variada de iogurtes e produtos infantis?" },
      { id: "ic_06", text: "A ilha está sem acúmulo de gelo?" },
      { id: "ic_07", text: "Os produtos estão dentro da validade?" },
      { id: "ic_08", text: "Organização FIFO" },
      { id: "ic_09", text: "Os motores estão limpos e sem acúmulo de poeira?" },
    ],
  },
  {
    id: "padaria",
    title: "PADARIA",
    items: [
      { id: "pa_01", text: "Os balcões estão limpos e abastecidos?" },
      { id: "pa_02", text: "Os utensílios e equipamentos estão limpos?" },
      { id: "pa_03", text: "Está sendo controlado as tiragens e sobras de pão? (Ctrl Preenchido)" },
      { id: "pa_04", text: "Está sendo exposto o mix completo? (salgados, doces, frios)" },
      { id: "pa_05", text: "As gôndolas de pães estão bem abastecidas? (integrais, forma, sabores)" },
      { id: "pa_06", text: "Todos os produtos estão precificados?" },
      { id: "pa_07", text: "Há cartazes de oferta?" },
      { id: "pa_08", text: "Há iluminação suficiente e ligada?" },
      { id: "pa_09", text: "Existe pelo menos um produto em degustação?" },
      { id: "pa_10", text: "Os uniformes estão limpos?" },
      { id: "pa_11", text: "O preço do Pão está devidamente exposto?" },
      { id: "pa_12", text: "O freezer onde estão guardados os pães congelados está limpo e organizado?" },
      { id: "pa_13", text: "Os produtos abertos estão com a embalagem preservada e amostra (presuntos, mortadelas, etc.)" },
      { id: "pa_14", text: "Os motores das geladeiras e freezers estão limpos e sem acúmulo de poeira?" },
    ],
  },
  {
    id: "acougue",
    title: "AÇOUGUE",
    items: [
      { id: "ac_01", text: "Os balcões estão limpos, abastecidos, organizados e decorados?" },
      { id: "ac_02", text: "Há iluminação suficiente e ligada?" },
      { id: "ac_03", text: "Os instrumentos estão limpos (facas, serras, etc)?" },
      { id: "ac_04", text: "Todo o mix está sendo exposto?" },
      { id: "ac_05", text: "Os uniformes estão limpos?" },
      { id: "ac_06", text: "O ambiente está isento de odor percebido pelos clientes?" },
      { id: "ac_07", text: "Há cartazes de oferta?" },
      { id: "ac_08", text: "Todos os produtos estão precificados?" },
      { id: "ac_09", text: "Os produtos abertos estão com a embalagem preservada e amostra (linguiças, frangos, etc.)" },
      { id: "ac_10", text: "O freezer de estoque está limpo e organizado?" },
      { id: "ac_11", text: "O relatório de perdas está sendo atualizado diariamente?" },
      { id: "ac_12", text: "Os motores das geladeiras e freezers estão limpos e sem acúmulo de poeira?" },
    ],
  },
  {
    id: "flv",
    title: "FLV",
    items: [
      { id: "fl_01", text: "O piso está limpo?" },
      { id: "fl_02", text: "As gôndolas estão arrumadas e coloridas? Produtos organizados?" },
      { id: "fl_03", text: "Todos os produtos estão precificados?" },
      { id: "fl_04", text: "Todos os produtos estão em condições de consumo?" },
      { id: "fl_05", text: "O relatório de perdas está sendo atualizado diariamente?" },
      { id: "fl_06", text: "Como estão sendo armazenadas as perdas?" },
      { id: "fl_07", text: "Há cartazes de oferta?" },
      { id: "fl_08", text: "A iluminação está adequada?" },
      { id: "fl_09", text: "As mercadorias estão sendo pesadas no recebimento? (relatório de divergências)" },
    ],
  },
  {
    id: "caixas",
    title: "CAIXAS",
    items: [
      { id: "cx_01", text: "O balcão está limpo e organizado? Os equipamentos?" },
      { id: "cx_02", text: "Os produtos estão devidamente abastecidos?" },
      { id: "cx_03", text: "Todos os produtos têm preço?" },
      { id: "cx_04", text: "O interior do balcão está limpo, organizado e abastecido?" },
      { id: "cx_05", text: "A sinalização do caixa está clara para os clientes?" },
      { id: "cx_06", text: "A iluminação está adequada?" },
      { id: "cx_07", text: "Os uniformes estão limpos?" },
      { id: "cx_08", text: "Os cigarros estão devidamente abastecidos? (inventário regular atualizado?)" },
      { id: "cx_09", text: "O troco externo e as gavetas são contadas no início e no fim do expediente?" },
      { id: "cx_10", text: "Os equipamentos estão funcionando corretamente?" },
    ],
  },
  {
    id: "atendimento",
    title: "ATENDIMENTO",
    items: [
      { id: "at_01", text: "Todos conhecem as promoções da semana?" },
      { id: "at_02", text: "Existem comunicações sobre as promoções aos clientes?" },
      { id: "at_03", text: "O caixa cumprimenta todos os clientes?" },
      { id: "at_04", text: "Os funcionários estão uniformizados e usam crachás?" },
      { id: "at_05", text: "O caixa e o empacotador se despedem dos clientes?" },
      { id: "at_06", text: "Os repositores levam os clientes até os produtos?" },
      { id: "at_07", text: "Os atendentes dos balcões oferecem produtos aos clientes?" },
      { id: "at_08", text: "Os atendentes dos balcões são cordiais e solícitos?" },
      { id: "at_09", text: "As cestinhas e carrinhos estão limpos e de fácil acesso aos clientes?" },
      { id: "at_10", text: "Todos estão alinhados quanto ao uso e cadastro do Clube de Ofertas?" },
      { id: "at_11", text: "O caixa oferece o clube de oferta no atendimento? Auxilia no cadastro de quem não tem?" },
    ],
  },
  {
    id: "promocao",
    title: "PROMOÇÃO / COMUNIC. / COMPETITIVIDADE",
    items: [
      { id: "pr_01", text: "Todas as ofertas estão bem sinalizadas, dentro e fora da loja?" },
      { id: "pr_02", text: "Existem itens com preços fora de mercado e/ou que devem ser melhorados?" },
      { id: "pr_03", text: "Existem pontos extras montados devidamente indicados e abastecidos?" },
      { id: "pr_04", text: "A loja transmite um \"clima promocional e alegre\"?" },
      { id: "pr_05", text: "Possui calendário promocional?" },
      { id: "pr_06", text: "Existe apelo ao cadastro no clube de desconto, visível e atraente?" },
    ],
  },
  {
    id: "geral",
    title: "GERAL",
    items: [
      { id: "ge_01", text: "Todos os pisos e vidros estão limpos?" },
      { id: "ge_02", text: "A iluminação é suficiente e está ligada?" },
      { id: "ge_03", text: "O depósito está limpo e organizado?" },
      { id: "ge_04", text: "O banheiro está limpo? (checklist de limpeza)" },
      { id: "ge_05", text: "O recebimento de notas está ok? (checklist preenchido)" },
      { id: "ge_06", text: "As instalações da loja estão bem feitas? Sem fios pendurados ou algo do tipo." },
      { id: "ge_07", text: "A rádio interna está funcionando corretamente? (Anúncio de promoções, volume.)" },
      { id: "ge_08", text: "A ventilação da loja está satisfatória?" },
      { id: "ge_09", text: "Os produtos de limpeza estão armazenados e utilizados corretamente? (diluição, quantidade)" },
      { id: "ge_10", text: "As notas de transferências estão sendo recebidas e conferidas?" },
      { id: "ge_11", text: "Não existem coisas fora do lugar? (equipamentos sem uso, descartes parados, etc.)" },
      { id: "ge_12", text: "Todas instalações da loja estão funcionando e com manutenção em dia? (checklist manutenção)" },
    ],
  },
];

export const ALL_ITEM_IDS = CHECKLIST_SECTIONS.flatMap((s) => s.items.map((i) => i.id));
export const TOTAL_ITEMS = ALL_ITEM_IDS.length;
