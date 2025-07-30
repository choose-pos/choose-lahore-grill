import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { FiDownload } from 'react-icons/fi';

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Courier',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  orderInfo: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 3,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    marginVertical: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    paddingBottom: 5,
    marginBottom: 10,
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  item: {
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  modifier: {
    marginLeft: 15,
    color: '#666666',
  },
  col6: {
    flex: 6,
  },
  col3: {
    flex: 3,
    textAlign: 'center',
  },
  col3Right: {
    flex: 3,
    textAlign: 'right',
  },
  summary: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    paddingTop: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    paddingTop: 10,
    fontWeight: 'bold',
  },
  notice: {
    backgroundColor: '#f0f9ff',
    padding: 10,
    marginTop: 15,
    borderRadius: 5,
  },
  footer: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#666666',
  },
});

// PDF Document Component
const OrderPDF = ({ order }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>ORDER RECEIPT</Text>
        <Text style={styles.orderInfo}>Order ID: {order._id}</Text>
        <Text style={styles.orderInfo}>Date: {new Date(order.createdAt).toLocaleString()}</Text>
        <Text style={styles.orderInfo}>Type: {order.orderType}</Text>
        <Text style={styles.orderInfo}>Payment: {order.paymentMethod}</Text>
      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCell, styles.col6]}>Item</Text>
        <Text style={[styles.tableHeaderCell, styles.col3]}>Qty</Text>
        <Text style={[styles.tableHeaderCell, styles.col3Right]}>Total</Text>
      </View>

      {order.items.map((item, index) => (
        <View key={index} style={styles.item}>
          <View style={styles.itemRow}>
            <Text style={styles.col6}>{item.itemName}</Text>
            <Text style={styles.col3}>{item.qty}</Text>
            <Text style={styles.col3Right}>
              ${(item.itemPrice * item.qty).toFixed(2)}
            </Text>
          </View>
          {item.modifierGroups.map((group, groupIndex) =>
            group.selectedModifiers.map((modifier, modIndex) => (
              <View key={`${groupIndex}-${modIndex}`} style={[styles.itemRow, styles.modifier]}>
                <Text style={styles.col6}>{modifier.modifierName}</Text>
                <Text style={styles.col3}>{modifier.qty}</Text>
                <Text style={styles.col3Right}>
                  ${(modifier.modifierPrice * modifier.qty).toFixed(2)}
                </Text>
              </View>
            ))
          )}
        </View>
      ))}

      <View style={styles.summary}>
        {order.discountAmount > 0 && (
          <View style={styles.summaryRow}>
            <Text>Discount</Text>
            <Text>-${order.discountAmount.toFixed(2)}</Text>
          </View>
        )}

        <View style={styles.summaryRow}>
          <Text>Gross Amount</Text>
          <Text>${order.grossAmount?.toFixed(2)}</Text>
        </View>

        {order.taxRate && (
          <View style={styles.summaryRow}>
            <Text>{order.taxRateName} ({order.taxRate}%)</Text>
            <Text>${order.taxAmount?.toFixed(2)}</Text>
          </View>
        )}

        {order.platformFees != null && (
          <View style={styles.summaryRow}>
            <Text>Platform Fee</Text>
            <Text>${order.platformFees.toFixed(2)}</Text>
          </View>
        )}

        {order.tip != null && (
          <View style={styles.summaryRow}>
            <Text>Tip</Text>
            <Text>${order.tip.toFixed(2)}</Text>
          </View>
        )}

        <View style={styles.totalRow}>
          <Text>Total</Text>
          <Text>${order.finalAmount?.toFixed(2)}</Text>
        </View>
      </View>

      {order.appliedDiscount?.loyaltyData && (
        <View style={styles.notice}>
          <Text>
            You used {order.appliedDiscount.loyaltyData.loyaltyPointsRedeemed} points
            {order.appliedDiscount.loyaltyData.redeemItem &&
              ` for ${order.appliedDiscount.loyaltyData.redeemItem.itemName}`}
            {order.appliedDiscount.loyaltyData.redeemDiscount &&
              ` for ${order.appliedDiscount.loyaltyData.redeemDiscount.discountValue}${order.appliedDiscount.loyaltyData.redeemDiscount.discountType === 'PERCENTAGE' ? '%' : '$'
              } off`}
          </Text>
        </View>
      )}

      {order.loyaltyTransactions?.length > 0 && (
        <View style={styles.notice}>
          {order.loyaltyTransactions.map((transaction, index) => (
            <Text key={index}>
              {transaction.transactionType === 'EARN' &&
                `You earned ${transaction.points} points in this order`}
            </Text>
          ))}
        </View>
      )}

      {order.restaurantRemarks && (
        <View style={[styles.notice, { marginTop: 10 }]}>
          <Text style={{ fontWeight: 'bold' }}>Restaurant Remarks</Text>
          <Text>{order.restaurantRemarks}</Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text>Thank you for your order!</Text>
      </View>
    </Page>
  </Document>
);

// Download Button Component
export const PDFDownloadButton = ({ order }) => (
  <PDFDownloadLink
    document={<OrderPDF order={order} />}
    fileName={`order-${order._id}.pdf`}
    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark"
    style={{
      color: isContrastOkay(
        Env.NEXT_PUBLIC_PRIMARY_COLOR,
        Env.NEXT_PUBLIC_BACKGROUND_COLOR
      )
        ? Env.NEXT_PUBLIC_BACKGROUND_COLOR
        : Env.NEXT_PUBLIC_TEXT_COLOR,
    }}
  >
    {({ loading }) => (
      <>
        <FiDownload className="mr-2" />
        {loading ? 'Generating PDF...' : 'Download PDF'}
      </>
    )}
  </PDFDownloadLink>
);