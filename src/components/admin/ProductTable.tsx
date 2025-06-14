
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit2, Trash2, Package } from 'lucide-react';
import { Product } from '@/hooks/useAdminData';

interface ProductTableProps {
  products: Product[];
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
  loading?: boolean;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  canEdit = false,
  canDelete = false,
  onEdit,
  onDelete,
  loading = false
}) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No products found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Brand</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Created</TableHead>
          {(canEdit || canDelete) && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>
              <div className="flex items-center space-x-3">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-12 h-12 object-cover rounded-lg border border-gray-300" 
                />
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                </div>
              </div>
            </TableCell>
            <TableCell className="font-medium">{product.brand}</TableCell>
            <TableCell>
              <Badge variant="outline" className="capitalize">
                {product.category}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                ₱{product.price}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                {product.stock} in stock
              </Badge>
            </TableCell>
            <TableCell className="text-sm text-gray-500">
              {new Date(product.created_at).toLocaleDateString()}
            </TableCell>
            {(canEdit || canDelete) && (
              <TableCell>
                <div className="flex items-center space-x-2">
                  {canEdit && onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(product)}
                      disabled={loading}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                  {canDelete && onDelete && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(product.id)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ProductTable;
