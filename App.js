import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, FlatList, Text } from 'react-native';
import { Header, Input, Button, ListItem, Icon } from 'react-native-elements';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('shoppinglistdb2.db');

export default function App() {
  const [product, setProduct] = useState('');
  const [amount, setAmount] = useState('');
  const [list, setList] = useState([]);

  const initialFocus = useRef(null);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql('create table if not exists shoppinglist (id integer primary key not null, product text, amount text);');
    }, null, updateList); 
  }, []);

  // Save list item/product
  const saveItem = () => {
    db.transaction(tx => {
        tx.executeSql('insert into shoppinglist (product, amount) values (?, ?);', [product, amount]);    
      }, null, updateList
    )
      setProduct("");
      setAmount("");
      initialFocus.current.focus();
  }

  // Update shopping list
  const updateList = () => {
    db.transaction(tx => {
      tx.executeSql('select * from shoppinglist;', [], (_, { rows }) =>
        setList(rows._array)
      );
    });
  }

  // Delete list item
  const deleteItem = (id) => {
    db.transaction(
      tx => {
        tx.executeSql('delete from shoppinglist where id = ?;', [id]);
      }, null, updateList
    )
  }

  return (
    <View style={styles.container}>
      <Header
        centerComponent={{ text: 'SHOPPING LIST', style: { color: '#FFFFFF', margin: 10 } }}
      />
      <Input placeholder='Product' label='PRODUCT' ref={initialFocus} onChangeText={(product) => setProduct(product)} value={product}/>
      <Input placeholder='Amount' label='AMOUNT' onChangeText={(amount) => setAmount(amount)} value={amount}/>
      <Button raised icon={{name: 'save', color: '#FFFFFF'}} onPress={saveItem} title='SAVE' />

      <FlatList
        style={styles.list}
        ListHeaderComponent={() => <Text>Contents</Text>}
        keyExtractor={(item) => String(item.id)}
        data={list}
        renderItem = {({ item }) =>
          <ListItem bottomDivider>
            <ListItem.Content>
              <ListItem.Title>{ item.product }</ListItem.Title>
              <ListItem.Subtitle>{ item.amount }</ListItem.Subtitle>
            </ListItem.Content>
            <Icon type="material" name="delete" iconStyle="sharp" color="red" onPress={() => deleteItem(item.id)} />
          </ListItem>
        }
      ></FlatList>
      </View>
  );
}

const styles = StyleSheet.create({
 container: {
  backgroundColor: '#fff',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 25,
  color: '#000000'
 },
 list: {
  margin: 30,
  width: '75%'
 }
});