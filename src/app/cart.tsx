import React, { useCallback, useState } from 'react';
import { View, Text, Alert, Linking, ScrollView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import Button from '@/components/button';
import Header from '@/components/header';
import Input from '@/components/input';
import LinkButton from '@/components/link-button';
import Product from '@/components/product';
import { ProductCartProps, useCartStore } from '@/stores/cart-store';
import formatCurrency from '@/utils/functions/format-currency';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';

const PHONE_NUMBER = '';

interface IAddress {
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
}

const Cart = () => {
  const cartStore = useCartStore();
  const navigation = useNavigation();

  const [address, setAddress] = useState<IAddress>({
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    localidade: '',
    bairro: '',
    uf: ''
  });

  const [showAddressDetails, setShowAddressDetails] = useState<boolean>(false);

  const getAdressFromApi = useCallback(() => {
    if (!address.cep || !/^[0-9]{8}$/.test(address.cep)) {
      Alert.alert(
        'CEP inválido',
        'Por favor, preencha o campo CEP com um valor válido.'
      );
      return;
    }

    fetch(`https://viacep.com.br/ws/${address.cep}/json/`)
      .then((res) => res.json())
      .then((data: IAddress) => {
        if (data.cep) {
          setAddress({
            bairro: data.bairro,
            localidade: data.localidade,
            numero: data.numero,
            complemento: data.complemento,
            logradouro: data.logradouro,
            uf: data.uf
          });
          setShowAddressDetails(true);
        } else {
          Alert.alert(
            'CEP não encontrado',
            'Por favor, verifique o CEP e tente novamente.'
          );
        }
      })
      .catch((err) => {
        console.log('erro: ', err);
        Alert.alert(
          'Erro',
          'Ocorreu um erro ao buscar o endereço. Tente novamente mais tarde.'
        );
      });
  }, [address.cep]);

  const handleCepInputChange = (text: string) => {
    setShowAddressDetails(false);
    setAddress((old) => ({ ...old, cep: text }));
  };

  const total = formatCurrency(
    cartStore.products.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    )
  );

  const isCepValid =
    typeof address.cep === 'string' && /^[0-9]{8}$/.test(address.cep);

  const handleProductRemove = (product: ProductCartProps) => {
    Alert.alert('Remover', `Desejar remover ${product.title} do carrinho?`, [
      {
        text: 'Cancelar'
      },
      {
        text: 'Remover',
        onPress: () => cartStore.remove(product.id)
      }
    ]);
  };

  const handleOrder = () => {
    const products = cartStore.products
      .map((product) => `\n ${product.quantity}x ${product.title}`)
      .join('');

    const message = `
    🍔 NOVO PEDIDO
    \n Entregar em: ${address.logradouro}, ${address.numero}, ${address.complemento},\n ${address.bairro}, ${address.localidade},

    ${products}

    \n Valor total: ${total}
    `;

    Linking.openURL(
      `http://api.whatsapp.com/send?phone=${PHONE_NUMBER}&text=${message}`
    );

    cartStore.clear();
    navigation.goBack();
  };

  return (
    <View className="flex-1 pt-8">
      <Header title="Seu carrinho" />

      <KeyboardAwareScrollView>
        <ScrollView>
          <View className="p-5 flex-1">
            {cartStore.products.length > 0 ? (
              <View className="border-b border-slate-700">
                {cartStore.products.map((product) => (
                  <Product
                    key={product.id}
                    data={product}
                    onPress={() => handleProductRemove(product)}
                  />
                ))}
              </View>
            ) : (
              <Text className="font-body text-slate-400 text-center my-8">
                Seu carrinho está vazio.
              </Text>
            )}

            <View className="flex-row gap-2 items-center mt-5 mb-4">
              <Text className="text-white text-xl font-subtitle">Total:</Text>
              <Text className="text-lime-400 text-2xl font-heading">
                {total}
              </Text>
            </View>

            <Input
              placeholder="Informe seu cep (somente números)"
              onSubmitEditing={getAdressFromApi}
              onChangeText={handleCepInputChange}
              keyboardType="numeric"
              maxLength={8}
              blurOnSubmit={true}
            />
            {showAddressDetails && (
              <>
                <Input
                  placeholder="Rua"
                  value={address.logradouro}
                  onChangeText={(text) =>
                    setAddress((old) => ({ ...old, logradouro: text }))
                  }
                />
                <Input
                  placeholder="Número"
                  value={address.numero}
                  onChangeText={(text) =>
                    setAddress((old) => ({ ...old, numero: text }))
                  }
                  keyboardType="numeric"
                />
                <Input
                  placeholder="Complemento"
                  value={address.complemento}
                  onChangeText={(text) =>
                    setAddress((old) => ({ ...old, complemento: text }))
                  }
                />
                <Input
                  placeholder="Bairro"
                  value={address.bairro}
                  onChangeText={(text) =>
                    setAddress((old) => ({ ...old, bairro: text }))
                  }
                />
                <Input
                  placeholder="Cidade"
                  value={address.localidade}
                  onChangeText={(text) =>
                    setAddress((old) => ({ ...old, localidade: text }))
                  }
                />
                <Input
                  placeholder="UF"
                  value={address.uf}
                  onChangeText={(text) =>
                    setAddress((old) => ({ ...old, uf: text }))
                  }
                />
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAwareScrollView>

      <View className="p-5 gap-5">
        <Button onPress={handleOrder} disabled={!isCepValid}>
          <Button.Text>Enviar pedido</Button.Text>
          <Button.Icon>
            <Feather name="arrow-right-circle" size={20} />
          </Button.Icon>
        </Button>

        <LinkButton title="Voltar ao cardápio" href="/" />
      </View>
    </View>
  );
};

export default Cart;
