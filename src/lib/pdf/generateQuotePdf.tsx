import {
    Page,
    Text,
    View,
    Document,
    StyleSheet,
    Font
  } from '@react-pdf/renderer'
  import { QuoteItem } from '@/types/quote'
  import { formatCurrency } from '@/utils/formatCurrency'
  
  Font.register({
    family: 'Helvetica',
    fonts: [
      { src: 'https://fonts.gstatic.com/s/helvetica/Helvetica.ttf' }
    ]
  })
  
  const styles = StyleSheet.create({
    page: {
      padding: 40,
      fontSize: 10,
      fontFamily: 'Helvetica',
      lineHeight: 1.6,
    },
    section: { marginBottom: 20 },
    heading: { fontSize: 16, marginBottom: 8, fontWeight: 'bold' },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    bold: { fontWeight: 'bold' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
    divider: { borderBottom: '1pt solid #ccc', marginVertical: 8 },
  })
  
  type Props = {
    jobName: string
    customerName: string
    jobsiteAddress: string
    selectedOptions: string[]
    items: QuoteItem[]
    markupPercentage: number
  }
  
  export function QuotePdf({
    jobName,
    customerName,
    jobsiteAddress,
    selectedOptions,
    items,
    markupPercentage
  }: Props) {
    const filtered = items.filter(i => selectedOptions.includes(i.optionLabel ?? ''))
  
    const subtotal = filtered.reduce((acc, item) => acc + item.total, 0)
    const markup = subtotal * (markupPercentage / 100)
    const gst = (subtotal + markup) * 0.1
    const total = subtotal + markup + gst
  
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.section}>
            <Text style={styles.heading}>SCSD Quotation</Text>
            <Text>Customer: {customerName}</Text>
            <Text>Jobsite: {jobsiteAddress}</Text>
          </View>
  
          {/* Items */}
          {filtered.map((item, i) => (
            <View key={i} style={styles.row}>
              <Text>{item.label}</Text>
              <Text>{formatCurrency(item.total)}</Text>
            </View>
          ))}
  
          <View style={styles.divider} />
  
          {/* Totals */}
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Markup ({markupPercentage}%)</Text>
            <Text>{formatCurrency(markup)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>GST (10%)</Text>
            <Text>{formatCurrency(gst)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.bold}>Total</Text>
            <Text style={styles.bold}>{formatCurrency(total)}</Text>
          </View>
        </Page>
      </Document>
    )
  }
  