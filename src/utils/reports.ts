import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Order } from '../types';

export const exportOrdersToPDF = (orders: Order[]) => {
  const doc = new jsPDF() as any;
  
  doc.text('Relatório de Pedidos - Doce Entrega', 14, 15);
  
  const tableData = orders.map(order => [
    order.id.slice(-6),
    order.userName,
    new Date(order.createdAt).toLocaleDateString(),
    order.paymentMethod,
    `R$ ${order.total.toFixed(2)}`,
    order.status
  ]);

  doc.autoTable({
    head: [['ID', 'Cliente', 'Data', 'Pagamento', 'Total', 'Status']],
    body: tableData,
    startY: 25,
  });

  doc.save(`pedidos_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportOrdersToExcel = (orders: Order[]) => {
  const data = orders.map(order => ({
    ID: order.id,
    Cliente: order.userName,
    Data: new Date(order.createdAt).toLocaleString(),
    Pagamento: order.paymentMethod,
    Total: order.total,
    Status: order.status,
    Endereco: order.address,
    Telefone: order.phone,
    Cupom: order.couponCode || 'Nenhum'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Pedidos');
  XLSX.writeFile(workbook, `pedidos_${new Date().toISOString().split('T')[0]}.xlsx`);
};
